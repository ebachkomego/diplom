// Маршруты аутентификации
const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login — вход в систему
router.post('/login', login);

// GET /api/auth/me — получение текущего пользователя
router.get('/me', authenticate, getMe);

module.exports = router;
