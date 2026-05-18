// Контроллер производственных заданий
const db = require('../database/connection');
const { insertAndGetId } = require('../utils/sqlHelpers');

// GET /api/production/tasks — список заданий
const getTasks = async (req, res, next) => {
  try {
    const { status, assigned_to } = req.query;
    let query = db('production_tasks as pt')
      .join('orders as o', 'pt.order_id', 'o.id')
      .join('products as p', 'pt.product_id', 'p.id')
      .leftJoin('users as u', 'pt.assigned_to', 'u.id')
      .select(
        'pt.*',
        'o.order_number',
        'p.name as product_name',
        'u.full_name as assigned_name'
      )
      .orderBy('pt.start_date', 'asc');

    if (status) query = query.where('pt.status', status);
    if (assigned_to) query = query.where('pt.assigned_to', assigned_to);

    // Мастер видит только свои задания
    if (req.user.role === 'мастер') {
      query = query.where('pt.assigned_to', req.user.id);
    }

    const tasks = await query;
    res.json(tasks);
  } catch (error) { next(error); }
};

// GET /api/production/tasks/:id — детали задания + этапы
const getTaskById = async (req, res, next) => {
  try {
    const task = await db('production_tasks as pt')
      .join('orders as o', 'pt.order_id', 'o.id')
      .join('products as p', 'pt.product_id', 'p.id')
      .leftJoin('users as u', 'pt.assigned_to', 'u.id')
      .select('pt.*', 'o.order_number', 'p.name as product_name', 'u.full_name as assigned_name')
      .where('pt.id', req.params.id)
      .first();

    if (!task) return res.status(404).json({ error: 'Задание не найдено' });

    const stages = await db('task_stages as ts')
      .join('production_stages as ps', 'ts.stage_id', 'ps.id')
      .leftJoin('resources as r', 'ps.resource_id', 'r.id')
      .select('ts.*', 'ps.name as stage_name', 'ps.stage_number', 'ps.duration_hours', 'r.name as resource_name')
      .where('ts.task_id', req.params.id)
      .orderBy('ps.stage_number');

    res.json({ ...task, stages });
  } catch (error) { next(error); }
};

// POST /api/production/tasks — создание задания из позиции заказа
const createTask = async (req, res, next) => {
  try {
    const { order_id, order_item_id, product_id, assigned_to, start_date, end_date, quantity, notes } = req.body;

    if (!order_id || !product_id) {
      return res.status(400).json({ error: 'Укажите заказ и продукт' });
    }

    // Проверяем наличие материалов на складе для производства данного количества
    const bom = await db('product_materials as pm')
      .join('materials as m', 'pm.material_id', 'm.id')
      .select('pm.material_id', 'pm.quantity as required_per_unit', 'm.name')
      .where('pm.product_id', product_id);

    const qty = quantity || 1;
    const shortages = [];

    for (const item of bom) {
      const stock = await db('warehouse')
        .where({ item_type: 'material', item_id: item.material_id })
        .first();
      const available = stock ? (stock.quantity - stock.reserved) : 0;
      const required = item.required_per_unit * qty;

      if (available < required) {
        shortages.push({
          material: item.name,
          required,
          available
        });
      }
    }

    if (shortages.length > 0) {
      return res.status(400).json({
        error: 'Недостаточно материалов на складе для запуска задания',
        shortages
      });
    }

    // Создаём задание и резервируем материалы в транзакции
    const taskId = await db.transaction(async trx => {
      const id = await insertAndGetId('production_tasks', {
        order_id, order_item_id, product_id, assigned_to,
        start_date, end_date, quantity: qty,
        status: 'ожидание', notes,
        created_at: new Date().toISOString()
      }, trx);

      // Получаем этапы продукта и создаём task_stages
      const stages = await trx('production_stages').where({ product_id }).orderBy('stage_number');
      if (stages.length > 0) {
        await trx('task_stages').insert(
          stages.map(s => ({ task_id: id, stage_id: s.id, status: 'ожидание' }))
        );
      }

      // Резервируем материалы на складе
      for (const item of bom) {
        await trx('warehouse')
          .where({ item_type: 'material', item_id: item.material_id })
          .update({ reserved: db.raw('reserved + ?', [item.required_per_unit * qty]) });
      }

      return id;
    });

    const task = await db('production_tasks').where({ id: taskId }).first();
    res.status(201).json(task);
  } catch (error) { next(error); }
};

// PATCH /api/production/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ожидание', 'в_работе', 'завершено', 'отменено'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус задания' });
    }

    const task = await db('production_tasks').where({ id: req.params.id }).first();
    if (!task) return res.status(404).json({ error: 'Задание не найдено' });

    // Если статус не меняется, просто возвращаем текущее задание
    if (task.status === status) return res.json(task);

    // Логика при завершении задания
    if (status === 'завершено' && task.status !== 'завершено') {
      await db.transaction(async trx => {
        // 1. Списываем материалы (уменьшаем кол-во и резерв)
        const bom = await trx('product_materials as pm')
          .select('material_id', 'quantity')
          .where('product_id', task.product_id);

        for (const item of bom) {
          const required = item.quantity * task.quantity;
          await trx('warehouse')
            .where({ item_type: 'material', item_id: item.material_id })
            .update({
              quantity: db.raw('quantity - ?', [required]),
              reserved: db.raw('reserved - ?', [required])
            });
        }

        // 2. Добавляем готовую продукцию на склад
        const stock = await trx('warehouse')
          .where({ item_type: 'product', item_id: task.product_id })
          .first();

        if (stock) {
          await trx('warehouse')
            .where({ id: stock.id })
            .update({
              quantity: db.raw('quantity + ?', [task.quantity]),
              updated_at: new Date().toISOString()
            });
        } else {
          await trx('warehouse').insert({
            item_type: 'product',
            item_id: task.product_id,
            quantity: task.quantity,
            reserved: 0,
            created_at: new Date().toISOString()
          });
        }

        // 3. Обновляем статус задания
        await trx('production_tasks').where({ id: task.id }).update({ status });
      });
    } 
    // Логика при отмене задания (высвобождаем резерв)
    else if (status === 'отменено' && task.status !== 'отменено') {
      await db.transaction(async trx => {
        const bom = await trx('product_materials as pm')
          .select('material_id', 'quantity')
          .where('product_id', task.product_id);

        for (const item of bom) {
          const required = item.quantity * task.quantity;
          await trx('warehouse')
            .where({ item_type: 'material', item_id: item.material_id })
            .update({ reserved: db.raw('reserved - ?', [required]) });
        }
        await trx('production_tasks').where({ id: task.id }).update({ status });
      });
    }
    // Обычная смена статуса
    else {
      await db('production_tasks').where({ id: req.params.id }).update({ status });
    }

    const updatedTask = await db('production_tasks').where({ id: req.params.id }).first();
    res.json(updatedTask);
  } catch (error) { next(error); }
};

// GET /api/production/gantt — данные для диаграммы Ганта
const getGanttData = async (req, res, next) => {
  try {
    const tasks = await db('production_tasks as pt')
      .join('orders as o', 'pt.order_id', 'o.id')
      .join('products as p', 'pt.product_id', 'p.id')
      .leftJoin('users as u', 'pt.assigned_to', 'u.id')
      .select(
        'pt.id', 'pt.start_date', 'pt.end_date', 'pt.status', 'pt.quantity',
        'o.order_number', 'p.name as product_name', 'u.full_name as assigned_name'
      )
      .whereNotNull('pt.start_date')
      .whereNotNull('pt.end_date')
      .orderBy('pt.start_date');

    // Формируем данные для frappe-gantt
    const ganttTasks = tasks.map(t => ({
      id: String(t.id),
      name: `${t.order_number}: ${t.product_name} (${t.quantity} шт.)`,
      start: t.start_date,
      end: t.end_date,
      progress: t.status === 'завершено' ? 100 : t.status === 'в_работе' ? 50 : 0,
      custom_class: `status-${t.status.replace('_', '-')}`,
      assigned: t.assigned_name || ''
    }));

    res.json(ganttTasks);
  } catch (error) { next(error); }
};

// GET /api/production/stages
const getStages = async (req, res, next) => {
  try {
    const stages = await db('production_stages as ps')
      .join('products as p', 'ps.product_id', 'p.id')
      .leftJoin('resources as r', 'ps.resource_id', 'r.id')
      .select('ps.*', 'p.name as product_name', 'r.name as resource_name')
      .orderBy(['ps.product_id', 'ps.stage_number']);
    res.json(stages);
  } catch (error) { next(error); }
};

module.exports = { getTasks, getTaskById, createTask, updateTaskStatus, getGanttData, getStages };
