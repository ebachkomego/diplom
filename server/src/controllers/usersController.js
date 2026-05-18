// Контроллер управления пользователями (администрирование)
const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const { insertAndGetId } = require('../utils/sqlHelpers');

const VALID_ROLES = ['администратор', 'менеджер', 'начальник_производства', 'мастер', 'кладовщик'];

const getAll = async (req, res, next) => {
  try {
    const users = await db('users')
      .select('id', 'username', 'full_name', 'role', 'email', 'is_active', 'created_at')
      .orderBy('full_name');
    res.json(users);
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const user = await db('users')
      .select('id', 'username', 'full_name', 'role', 'email', 'is_active', 'created_at')
      .where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { username, password, full_name, role, email } = req.body;
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль', valid: VALID_ROLES });
    }

    const existing = await db('users').where({ username }).first();
    if (existing) return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });

    const password_hash = await bcrypt.hash(password, 10);
    const id = await insertAndGetId('users', { username, password_hash, full_name, role, email, is_active: true });
    const user = await db('users').select('id', 'username', 'full_name', 'role', 'email', 'is_active').where({ id }).first();
    res.status(201).json(user);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const { full_name, role, email, password } = req.body;
    const updateData = { full_name, role, email };
    if (password) updateData.password_hash = await bcrypt.hash(password, 10);
    await db('users').where({ id: req.params.id }).update(updateData);
    const user = await db('users').select('id', 'username', 'full_name', 'role', 'email', 'is_active').where({ id: req.params.id }).first();
    res.json(user);
  } catch (error) { next(error); }
};

// PATCH /api/users/:id/toggle — переключение активности
const toggleActive = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await db('users').where({ id: req.params.id }).update({ is_active: !user.is_active });
    res.json({ message: `Пользователь ${!user.is_active ? 'активирован' : 'деактивирован'}` });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить собственную учётную запись' });
    }
    await db('users').where({ id: req.params.id }).del();
    res.json({ message: 'Пользователь удалён' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, toggleActive, remove };
