// Контроллер заказов — полная реализация CRUD и управления статусами
const db = require('../database/connection');
const { insertAndGetId } = require('../utils/sqlHelpers');

// Допустимые переходы между статусами заказа
const STATUS_TRANSITIONS = {
  'новый':             ['на_согласовании', 'отклонён'],
  'на_согласовании':   ['подтверждён', 'отклонён'],
  'подтверждён':       ['в_производстве'],
  'в_производстве':    ['готов'],
  'готов':             ['отгружен'],
  'отгружен':          ['завершён'],
  'завершён':          [],
  'отклонён':          [],
};

// Генерация номера заказа вида ЗК-ГГГГ-NNN
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const last = await db('orders')
    .where('order_number', 'like', `ЗК-${year}-%`)
    .orderBy('id', 'desc')
    .first();
  const num = last
    ? String(parseInt(last.order_number.split('-')[2]) + 1).padStart(3, '0')
    : '001';
  return `ЗК-${year}-${num}`;
};

// GET /api/orders — список заказов с фильтрацией и пагинацией
const getAll = async (req, res, next) => {
  try {
    const { status, priority, customer_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .leftJoin('users as u', 'o.created_by', 'u.id')
      .select(
        'o.*',
        'c.name as customer_name',
        'c.contact_person',
        'u.full_name as created_by_name'
      )
      .orderBy('o.created_at', 'desc');

    if (status) query = query.where('o.status', status);
    if (priority) query = query.where('o.priority', priority);
    if (customer_id) query = query.where('o.customer_id', customer_id);
    if (search) {
      query = query.where(function() {
        this.where('o.order_number', 'like', `%${search}%`)
            .orWhere('c.name', 'like', `%${search}%`);
      });
    }

    // Фильтр по роли: мастер видит только задания, но заказы — все
    const total = await query.clone().clearSelect().clearOrder().count('o.id as count').first();
    const orders = await query.limit(parseInt(limit)).offset(offset);

    res.json({
      data: orders,
      pagination: {
        total: parseInt(total.count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id — детали заказа
const getById = async (req, res, next) => {
  try {
    const order = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .leftJoin('users as u', 'o.created_by', 'u.id')
      .select(
        'o.*',
        'c.name as customer_name',
        'c.contact_person',
        'c.phone as customer_phone',
        'c.email as customer_email',
        'u.full_name as created_by_name'
      )
      .where('o.id', req.params.id)
      .first();

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Получаем позиции заказа
    const items = await db('order_items as oi')
      .join('products as p', 'oi.product_id', 'p.id')
      .select('oi.*', 'p.name as product_name', 'p.article', 'p.unit')
      .where('oi.order_id', req.params.id);

    // Получаем производственные задания
    const tasks = await db('production_tasks as pt')
      .join('products as p', 'pt.product_id', 'p.id')
      .leftJoin('users as u', 'pt.assigned_to', 'u.id')
      .select('pt.*', 'p.name as product_name', 'u.full_name as assigned_name')
      .where('pt.order_id', req.params.id);

    res.json({ ...order, items, tasks });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders — создание заказа
const create = async (req, res, next) => {
  try {
    const { customer_id, priority, planned_date, notes, items } = req.body;

    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Укажите клиента и состав заказа' });
    }

    const order_number = await generateOrderNumber();

    // Считаем итоговую стоимость
    const productIds = items.map(i => i.product_id);
    const products = await db('products').whereIn('id', productIds);
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    let total_cost = 0;
    const orderItems = items.map(item => {
      const product = productMap[item.product_id];
      const unit_price = item.unit_price || product?.price || 0;
      const total_price = unit_price * item.quantity;
      total_cost += total_price;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price,
        total_price
      };
    });

    // Вставляем заказ и позиции в транзакции
    const orderId = await db.transaction(async trx => {
      const id = await insertAndGetId('orders', {
        order_number,
        customer_id,
        created_by: req.user.id,
        status: 'новый',
        priority: priority || 'средний',
        planned_date,
        total_cost,
        notes,
        created_at: new Date().toISOString()
      }, trx);

      await trx('order_items').insert(
        orderItems.map(item => ({ order_id: id, ...item }))
      );

      return id;
    });

    const newOrder = await db('orders').where({ id: orderId }).first();
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id — обновление заказа
const update = async (req, res, next) => {
  try {
    const { customer_id, priority, planned_date, notes } = req.body;
    const order = await db('orders').where({ id: req.params.id }).first();

    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (!['новый', 'на_согласовании'].includes(order.status)) {
      return res.status(400).json({ error: 'Нельзя редактировать заказ в данном статусе' });
    }

    const affected = await db('orders').where({ id: req.params.id }).update({
      customer_id, priority, planned_date, notes
    });
    if (affected === 0) return res.status(404).json({ error: 'Заказ не найден или недостаточно прав для изменения' });

    const updated = await db('orders').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status — смена статуса
const changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await db('orders').where({ id: req.params.id }).first();

    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Недопустимый переход: из "${order.status}" в "${status}"`,
        allowed_transitions: allowed
      });
    }

    await db.transaction(async trx => {
      // Если отгружаем — списываем готовую продукцию со склада
      if (status === 'отгружен') {
        const items = await trx('order_items').where({ order_id: order.id });
        for (const item of items) {
          const stock = await trx('warehouse')
            .where({ item_type: 'product', item_id: item.product_id })
            .first();
          
          if (!stock || stock.quantity < item.quantity) {
            throw new Error(`Недостаточно продукции "${item.product_id}" на складе для отгрузки`);
          }

          await trx('warehouse')
            .where({ id: stock.id })
            .update({ 
              quantity: db.raw('quantity - ?', [item.quantity]),
              updated_at: new Date().toISOString()
            });
        }
      }

      const updateData = { status };
      if (status === 'завершён') updateData.completed_date = new Date().toISOString().split('T')[0];

      await trx('orders').where({ id: req.params.id }).update(updateData);
    });

    const updated = await db('orders').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (error) {
    if (error.message.includes('Недостаточно продукции')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// DELETE /api/orders/:id — удаление (только новые заказы)
const remove = async (req, res, next) => {
  try {
    const order = await db('orders').where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (order.status !== 'новый') {
      return res.status(400).json({ error: 'Можно удалять только заказы со статусом "Новый"' });
    }

    const affected = await db('orders').where({ id: req.params.id }).del();
    if (affected === 0) return res.status(404).json({ error: 'Заказ не найден или недостаточно прав для удаления' });
    res.json({ message: 'Заказ удалён' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, changeStatus, remove };
