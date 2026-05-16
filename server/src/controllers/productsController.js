// Контроллер продукции
const db = require('../database/connection');

// GET /api/products — список продукции с фильтрацией
const getAll = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = db('products').orderBy('name');
    if (category) query = query.where({ category });
    if (search) query = query.where('name', 'like', `%${search}%`)
      .orWhere('article', 'like', `%${search}%`);
    const products = await query;
    res.json(products);
  } catch (error) { next(error); }
};

// GET /api/products/:id — продукт + BOM + этапы
const getById = async (req, res, next) => {
  try {
    const product = await db('products').where({ id: req.params.id }).first();
    if (!product) return res.status(404).json({ error: 'Продукт не найден' });

    const materials = await db('product_materials as pm')
      .join('materials as m', 'pm.material_id', 'm.id')
      .select('pm.*', 'm.name as material_name', 'm.article as material_article', 'm.unit')
      .where('pm.product_id', req.params.id);

    const stages = await db('production_stages as ps')
      .leftJoin('resources as r', 'ps.resource_id', 'r.id')
      .select('ps.*', 'r.name as resource_name')
      .where('ps.product_id', req.params.id)
      .orderBy('ps.stage_number');

    res.json({ ...product, materials, stages });
  } catch (error) { next(error); }
};

// POST /api/products — создание
const create = async (req, res, next) => {
  try {
    const { name, article, description, unit, price, production_time_hours, category } = req.body;
    const [id] = await db('products').insert({ name, article, description, unit, price, production_time_hours, category });
    const product = await db('products').where({ id }).first();
    res.status(201).json(product);
  } catch (error) { next(error); }
};

// PUT /api/products/:id — обновление
const update = async (req, res, next) => {
  try {
    const { name, article, description, unit, price, production_time_hours, category } = req.body;
    await db('products').where({ id: req.params.id }).update({ name, article, description, unit, price, production_time_hours, category });
    const product = await db('products').where({ id: req.params.id }).first();
    res.json(product);
  } catch (error) { next(error); }
};

// DELETE /api/products/:id
const remove = async (req, res, next) => {
  try {
    await db('products').where({ id: req.params.id }).del();
    res.json({ message: 'Продукт удалён' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
