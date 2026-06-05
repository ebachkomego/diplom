// Контроллер аутентификации
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const { JWT_SECRET } = require('../middleware/auth');
const { sendLoginNotification } = require('../utils/emailNotifier');

// POST /api/auth/login — вход в систему
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Введите логин и пароль' });
    }

    // Ищем пользователя по логину
    const user = await db('users').where({ username }).first();

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Аккаунт деактивирован. Обратитесь к администратору.' });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Генерируем JWT-токен со сроком действия 8 часов (рабочая смена)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    db('settings').where({ key: 'notification_email' }).first()
      .then(row => {
        if (row?.value) sendLoginNotification(row.value, user, ip, userAgent);
      })
      .catch(() => {});

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me — получение текущего пользователя
const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, getMe };
