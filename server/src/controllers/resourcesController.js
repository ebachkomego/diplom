// Контроллер ресурсов (оборудование)
const db = require('../database/connection');

const getAll = async (req, res, next) => {
  try {
    const { workshop, quality_grade, type } = req.query;
    let query = db('resources');
    
    if (workshop) {
      query = query.where('location', workshop);
    }
    if (quality_grade) {
      query = query.where('quality_grade', quality_grade);
    }
    if (type) {
      query = query.where('type', type);
    }
    
    const resources = await query.orderBy(['location', 'name']);
    res.json(resources);
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const resource = await db('resources').where({ id: req.params.id }).first();
    if (!resource) return res.status(404).json({ error: 'Ресурс не найден' });

    // Текущие задания на этом ресурсе
    const tasks = await db('task_stages as ts')
      .join('production_stages as ps', 'ts.stage_id', 'ps.id')
      .join('production_tasks as pt', 'ts.task_id', 'pt.id')
      .join('products as p', 'pt.product_id', 'p.id')
      .join('orders as o', 'pt.order_id', 'o.id')
      .select('ts.*', 'ps.name as stage_name', 'p.name as product_name', 'o.order_number', 'pt.start_date', 'pt.end_date')
      .where('ps.resource_id', req.params.id)
      .where('ts.status', '!=', 'завершено')
      .orderBy('pt.start_date');

    res.json({ ...resource, active_tasks: tasks });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { name, type, capacity, status, location, notes, quality_grade, precision_grade, workshop_type, year_manufactured, manufacturer } = req.body;
    const [id] = await db('resources').insert({ 
      name, type, capacity, status: status || 'активен', location, notes,
      quality_grade: quality_grade || 'стандарт',
      precision_grade: precision_grade || 7,
      workshop_type: workshop_type || 'механообработка',
      year_manufactured,
      manufacturer
    });
    const resource = await db('resources').where({ id }).first();
    res.status(201).json(resource);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const { name, type, capacity, status, location, notes, quality_grade, precision_grade, workshop_type, year_manufactured, manufacturer } = req.body;
    await db('resources').where({ id: req.params.id }).update({ 
      name, type, capacity, status, location, notes,
      quality_grade, precision_grade, workshop_type, year_manufactured, manufacturer
    });
    const resource = await db('resources').where({ id: req.params.id }).first();
    res.json(resource);
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await db('resources').where({ id: req.params.id }).del();
    res.json({ message: 'Ресурс удалён' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
