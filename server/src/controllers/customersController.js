// Контроллер клиентов
const db = require('../database/connection');
const { insertAndGetId } = require('../utils/sqlHelpers');

const getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = db('customers').orderBy('name');
    if (search) query = query.where('name', 'like', `%${search}%`)
      .orWhere('inn', 'like', `%${search}%`);
    const customers = await query;
    res.json(customers);
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const customer = await db('customers').where({ id: req.params.id }).first();
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    // Список заказов клиента
    const orders = await db('orders')
      .where({ customer_id: req.params.id })
      .orderBy('created_at', 'desc')
      .limit(10);

    // Статистика
    const stats = await db('orders')
      .where({ customer_id: req.params.id })
      .select(
        db.raw('COUNT(*) as total_orders'),
        db.raw('SUM(total_cost) as total_sum'),
        db.raw('COUNT(CASE WHEN status = "завершён" THEN 1 END) as completed')
      )
      .first();

    res.json({ ...customer, recent_orders: orders, stats });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { name, contact_person, phone, email, address, inn } = req.body;
    if (!name) return res.status(400).json({ error: 'Наименование клиента обязательно' });
    const id = await insertAndGetId('customers', { name, contact_person, phone, email, address, inn });
    const customer = await db('customers').where({ id }).first();
    res.status(201).json(customer);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const { name, contact_person, phone, email, address, inn } = req.body;
    const affected = await db('customers').where({ id: req.params.id }).update({ name, contact_person, phone, email, address, inn });
    if (affected === 0) return res.status(404).json({ error: 'Клиент не найден или недостаточно прав для изменения' });
    const customer = await db('customers').where({ id: req.params.id }).first();
    res.json(customer);
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const hasOrders = await db('orders').where({ customer_id: req.params.id }).first();
    if (hasOrders) return res.status(400).json({ error: 'Нельзя удалить клиента с существующими заказами' });
    const affected = await db('customers').where({ id: req.params.id }).del();
    if (affected === 0) return res.status(404).json({ error: 'Клиент не найден или недостаточно прав для удаления' });
    res.json({ message: 'Клиент удалён' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
