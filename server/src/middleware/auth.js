// Middleware аутентификации — проверка JWT-токена
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'taim_secret_key_2026';

// Проверяет наличие и валидность JWT-токена в заголовке Authorization
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация. Токен не предоставлен.' });
    }

    const token = authHeader.split(' ')[1];

    // Верификация токена
    const decoded = jwt.verify(token, JWT_SECRET);

    // Получаем пользователя из БД для проверки актуальности
    const user = await db('users').where({ id: decoded.id }).first();

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Пользователь не найден или деактивирован.' });
    }

    // Добавляем данные пользователя в объект запроса
    req.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Срок действия токена истёк. Войдите в систему повторно.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Недействительный токен авторизации.' });
    }
    return res.status(500).json({ error: 'Ошибка сервера при проверке авторизации.' });
  }
};

module.exports = { authenticate, JWT_SECRET };
