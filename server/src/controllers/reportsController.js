const db = require('../database/connection');
const { formatMonth, daysFromNow, currentMonth, insertAndGetId } = require('../utils/sqlHelpers');

const chartDatasets = {
  orders: {
    id: 'orders',
    label: 'Заказы',
    table: 'orders as o',
    dimensions: {
      status: { expression: 'o.status' },
      priority: { expression: 'o.priority' },
      month: { expression: formatMonth('o.created_at') }
    },
    metrics: {
      total_cost: { expression: 'o.total_cost' },
      id: { expression: 'o.id' }
    }
  },
  production_tasks: {
    id: 'production_tasks',
    label: 'Производственные задания',
    table: 'production_tasks as pt',
    dimensions: {
      status: { expression: 'pt.status' },
      month: { expression: formatMonth('pt.created_at') }
    },
    metrics: {
      quantity: { expression: 'pt.quantity' },
      id: { expression: 'pt.id' }
    }
  },
  resources: {
    id: 'resources',
    label: 'Ресурсы',
    table: 'resources as r',
    dimensions: {
      type: { expression: 'r.type' },
      status: { expression: 'r.status' }
    },
    metrics: {
      capacity: { expression: 'r.capacity' },
      id: { expression: 'r.id' }
    }
  }
};

// GET /api/reports/dashboard — данные для главного дашборда
const getDashboard = async (req, res, next) => {
  try {
    // KPI-показатели
    const totalOrders = await db('orders').count('id as count').first();
    const inProduction = await db('orders').where('status', 'в_производстве').count('id as count').first();
    const completedThisMonth = await db('orders')
      .where('status', 'завершён')
      .whereRaw(`${formatMonth('completed_date')} = ${currentMonth()}`)
      .count('id as count').first();
    const totalRevenue = await db('orders')
      .where('status', 'завершён')
      .sum('total_cost as total').first();

    // Заказы по статусам
    const byStatus = await db('orders')
      .select('status')
      .count('id as count')
      .groupBy('status');

    // Последние 5 АКТИВНЫХ заказов (исключая архивные)
    const recentOrders = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .select('o.id', 'o.order_number', 'c.name as customer_name', 'o.status', 'o.priority', 'o.total_cost', 'o.planned_date')
      .whereNotIn('o.status', ['завершён', 'отгружен', 'отклонён'])
      .orderBy('o.created_at', 'desc')
      .limit(5);

    // Заказы с истекающим дедлайном (следующие 7 дней)
    const urgentOrders = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .select('o.id', 'o.order_number', 'c.name as customer_name', 'o.planned_date', 'o.status')
      .whereNotIn('o.status', ['завершён', 'отгружен', 'отклонён'])
      .whereRaw(`${daysFromNow('planned_date')} BETWEEN 0 AND 7`)
      .orderBy('o.planned_date');

    // Просроченные заказы
    const overdueOrders = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .select('o.id', 'o.order_number', 'c.name as customer_name', 'o.planned_date', 'o.status')
      .whereNotIn('o.status', ['завершён', 'отгружен', 'отклонён'])
      .whereRaw(`${daysFromNow('planned_date')} < 0`)
      .orderBy('o.planned_date');

    // Критические остатки материалов
    const lowStock = await db('warehouse as w')
      .join('materials as m', function() {
        this.on('w.item_type', db.raw("'material'")).andOn('w.item_id', 'm.id');
      })
      .select('m.name', 'm.article', 'm.min_stock', 'w.quantity', 'w.reserved')
      .whereRaw('(w.quantity - w.reserved) <= m.min_stock')
      .limit(5);

    res.json({
      kpi: {
        total_orders: parseInt(totalOrders.count),
        in_production: parseInt(inProduction.count),
        completed_this_month: parseInt(completedThisMonth.count),
        total_revenue: totalRevenue.total || 0
      },
      by_status: byStatus,
      recent_orders: recentOrders,
      urgent_orders: urgentOrders,
      overdue_orders: overdueOrders,
      low_stock: lowStock
    });
  } catch (error) { next(error); }
};

// GET /api/reports/orders-dynamics — динамика заказов по месяцам
const getOrdersDynamics = async (req, res, next) => {
  try {
    const data = await db('orders')
      .select(
        db.raw(`${formatMonth('created_at')} as month`),
        db.raw('COUNT(*) as count'),
        db.raw('SUM(total_cost) as total')
      )
      .groupByRaw(formatMonth('created_at'))
      .orderByRaw(formatMonth('created_at'))
      .limit(12);
    res.json(data);
  } catch (error) { next(error); }
};

// GET /api/reports/resource-load — загрузка ресурсов
const getResourceLoad = async (req, res, next) => {
  try {
    const data = await db('resources as r')
      .leftJoin('production_stages as ps', 'r.id', 'ps.resource_id')
      .leftJoin('task_stages as ts', function() {
        this.on('ps.id', 'ts.stage_id').andOn('ts.status', db.raw("'в_работе'"));
      })
      .select(
        'r.id', 'r.name', 'r.type', 'r.capacity', 'r.status',
        db.raw('COUNT(ts.id) as active_tasks')
      )
      .groupBy('r.id')
      .orderBy('r.name');
    res.json(data);
  } catch (error) { next(error); }
};

// GET /api/reports/plan-fact — план vs факт производства
const getPlanFact = async (req, res, next) => {
  try {
    const data = await db('production_tasks as pt')
      .join('products as p', 'pt.product_id', 'p.id')
      .select(
        'p.name as product_name',
        db.raw('SUM(pt.quantity) as planned_qty'),
        db.raw('SUM(CASE WHEN pt.status = "завершено" THEN pt.quantity ELSE 0 END) as actual_qty'),
        db.raw('COUNT(*) as total_tasks'),
        db.raw('COUNT(CASE WHEN pt.status = "завершено" THEN 1 END) as completed_tasks')
      )
      .groupBy('pt.product_id')
      .orderBy('planned_qty', 'desc')
      .limit(10);
    res.json(data);
  } catch (error) { next(error); }
};

// GET /api/reports/order-cost/:id — себестоимость заказа
const getOrderCost = async (req, res, next) => {
  try {
    const order = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .select('o.*', 'c.name as customer_name')
      .where('o.id', req.params.id).first();

    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    const items = await db('order_items as oi')
      .join('products as p', 'oi.product_id', 'p.id')
      .select('oi.*', 'p.name as product_name', 'p.article', 'p.production_time_hours')
      .where('oi.order_id', req.params.id);

    // Считаем материальные затраты по BOM
    for (const item of items) {
      const bom = await db('product_materials as pm')
        .join('materials as m', 'pm.material_id', 'm.id')
        .select('m.name', 'pm.quantity', 'm.price',
          db.raw('pm.quantity * m.price as unit_cost'),
          db.raw('pm.quantity * m.price * ? as total_cost', [item.quantity])
        )
        .where('pm.product_id', item.product_id);

      item.bom = bom;
      item.material_cost = bom.reduce((s, b) => s + b.total_cost, 0);
    }

    res.json({ order, items });
  } catch (error) { next(error); }
};

const getChartBuilderDatasets = async (req, res, next) => {
  try {
    const datasets = Object.values(chartDatasets).map((dataset) => ({
      id: dataset.id,
      label: dataset.label,
      dimensions: Object.keys(dataset.dimensions).map((key) => ({ key, label: key })),
      metrics: Object.keys(dataset.metrics).map((key) => ({ key, label: key }))
    }));
    res.json({ datasets });
  } catch (error) {
    next(error);
  }
};

const queryChartBuilder = async (req, res, next) => {
  try {
    const { source, dimension, metric, aggregation = 'sum' } = req.body;
    const dataset = chartDatasets[source];
    if (!dataset) {
      return res.status(400).json({ error: 'Неизвестный источник данных' });
    }
    if (!dataset.dimensions[dimension]) {
      return res.status(400).json({ error: 'Недоступное измерение' });
    }
    if (!dataset.metrics[metric]) {
      return res.status(400).json({ error: 'Недоступная метрика' });
    }

    const aggregationMap = {
      sum: 'SUM',
      avg: 'AVG',
      count: 'COUNT'
    };
    const aggFn = aggregationMap[aggregation] || 'SUM';
    const metricExpr = dataset.metrics[metric].expression;
    const dimensionExpr = dataset.dimensions[dimension].expression;

    const rows = await db(dataset.table)
      .select(
        db.raw(`${dimensionExpr} as label`),
        db.raw(`${aggFn}(${metricExpr}) as value`)
      )
      .groupBy('label')
      .orderBy('value', 'desc')
      .limit(20);

    const data = rows.map((item) => ({
      label: item.label || 'Без категории',
      value: Number(item.value || 0)
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getChartTemplates = async (req, res, next) => {
  try {
    const hasTable = await db.schema.hasTable('chart_templates');
    if (!hasTable) {
      return res.json([]);
    }

    const templates = await db('chart_templates')
      .where((builder) => {
        builder.where('owner_id', req.user.id).orWhere('scope', 'public').orWhere('scope', 'role');
      })
      .andWhere((builder) => {
        builder.whereNull('role').orWhere('role', req.user.role);
      })
      .orderBy('updated_at', 'desc');
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

const createChartTemplate = async (req, res, next) => {
  try {
    const hasTable = await db.schema.hasTable('chart_templates');
    if (!hasTable) {
      return res.status(503).json({ error: 'Хранилище шаблонов еще не инициализировано' });
    }

    const { name, config, scope = 'private', role = null } = req.body;
    if (!name || !config) {
      return res.status(400).json({ error: 'Название и конфигурация обязательны' });
    }

    const id = await insertAndGetId('chart_templates', {
      name,
      config_json: JSON.stringify(config),
      scope,
      role,
      owner_id: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const template = await db('chart_templates').where({ id }).first();
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

const initializeChartTemplates = async (req, res, next) => {
  try {
    const exists = await db.schema.hasTable('chart_templates');
    if (exists) {
      return res.json({ message: 'Хранилище уже инициализировано' });
    }

    await db.schema.createTable('chart_templates', (table) => {
      table.increments('id').primary();
      table.string('name', 200).notNullable();
      table.text('config_json').notNullable();
      table.string('scope', 20).notNullable().defaultTo('private');
      table.string('role', 50).nullable();
      table.integer('owner_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    res.status(201).json({ message: 'Хранилище шаблонов успешно инициализировано' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getOrdersDynamics,
  getResourceLoad,
  getPlanFact,
  getOrderCost,
  getChartBuilderDatasets,
  queryChartBuilder,
  getChartTemplates,
  createChartTemplate,
  initializeChartTemplates
};
