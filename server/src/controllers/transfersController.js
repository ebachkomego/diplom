// Контроллер для управления передачами деталей между цехами (WIP transfers)
const db = require('../database/connection');

// GET /api/transfers — список всех передач с фильтрацией
const getAll = async (req, res, next) => {
  try {
    const { status, from_workshop, to_workshop, task_id } = req.query;
    
    let query = db('wip_transfers as wt')
      .select(
        'wt.*',
        'u1.full_name as transferred_by_name',
        'u2.full_name as received_by_name',
        'pt.status as task_status',
        'o.order_number',
        'p.name as product_name'
      )
      .leftJoin('users as u1', 'wt.transferred_by', 'u1.id')
      .leftJoin('users as u2', 'wt.received_by', 'u2.id')
      .leftJoin('production_tasks as pt', 'wt.task_id', 'pt.id')
      .leftJoin('orders as o', 'pt.order_id', 'o.id')
      .leftJoin('products as p', 'pt.product_id', 'p.id');

    if (status) {
      query = query.where('wt.status', status);
    }
    if (from_workshop) {
      query = query.where('wt.from_workshop', from_workshop);
    }
    if (to_workshop) {
      query = query.where('wt.to_workshop', to_workshop);
    }
    if (task_id) {
      query = query.where('wt.task_id', task_id);
    }

    const transfers = await query.orderBy('wt.created_at', 'desc');
    res.json(transfers);
  } catch (error) {
    next(error);
  }
};

// GET /api/transfers/:id — детали передачи
const getById = async (req, res, next) => {
  try {
    const transfer = await db('wip_transfers as wt')
      .select(
        'wt.*',
        'u1.full_name as transferred_by_name',
        'u2.full_name as received_by_name',
        'r1.name as from_resource_name',
        'r2.name as to_resource_name',
        'ps.name as stage_name'
      )
      .leftJoin('users as u1', 'wt.transferred_by', 'u1.id')
      .leftJoin('users as u2', 'wt.received_by', 'u2.id')
      .leftJoin('resources as r1', 'wt.from_resource_id', 'r1.id')
      .leftJoin('resources as r2', 'wt.to_resource_id', 'r2.id')
      .leftJoin('production_stages as ps', 'wt.stage_id', 'ps.id')
      .where('wt.id', req.params.id)
      .first();

    if (!transfer) {
      return res.status(404).json({ error: 'Передача не найдена' });
    }

    res.json(transfer);
  } catch (error) {
    next(error);
  }
};

// POST /api/transfers — создание новой передачи
const create = async (req, res, next) => {
  try {
    const {
      task_id,
      from_resource_id,
      to_resource_id,
      from_workshop,
      to_workshop,
      stage_id,
      part_name,
      quantity,
      notes
    } = req.body;

    const [id] = await db('wip_transfers').insert({
      task_id,
      from_resource_id,
      to_resource_id,
      from_workshop,
      to_workshop,
      stage_id,
      part_name,
      quantity,
      status: 'в_ожидании',
      notes,
      created_at: new Date().toISOString()
    });

    const transfer = await db('wip_transfers').where({ id }).first();
    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/transfers/:id/transfer — отправка детали
const transferOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db('wip_transfers')
      .where({ id })
      .update({
        status: 'в_пути',
        transfer_date: new Date().toISOString(),
        transferred_by: req.user.id
      });

    const transfer = await db('wip_transfers').where({ id }).first();
    res.json(transfer);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/transfers/:id/receive — получение детали
const transferIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db('wip_transfers')
      .where({ id })
      .update({
        status: 'принято',
        receive_date: new Date().toISOString(),
        received_by: req.user.id
      });

    const transfer = await db('wip_transfers').where({ id }).first();
    res.json(transfer);
  } catch (error) {
    next(error);
  }
};

// GET /api/transfers/stats — статистика по передачам между цехами
const getStats = async (req, res, next) => {
  try {
    const stats = await db('wip_transfers')
      .select('from_workshop', 'to_workshop', 'status')
      .count('* as count')
      .groupBy('from_workshop', 'to_workshop', 'status');

    // Агрегируем по цехам
    const byWorkshop = {};
    stats.forEach(row => {
      const key = `${row.from_workshop} → ${row.to_workshop}`;
      if (!byWorkshop[key]) {
        byWorkshop[key] = {
          route: key,
          from: row.from_workshop,
          to: row.to_workshop,
          counts: {}
        };
      }
      byWorkshop[key].counts[row.status] = row.count;
    });

    res.json({
      routes: Object.values(byWorkshop),
      total: stats.reduce((sum, s) => sum + s.count, 0)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  transferOut,
  transferIn,
  getStats
};
