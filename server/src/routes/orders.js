// Маршруты заказов
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordersController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Все маршруты требуют аутентификации
router.use(authenticate);

// GET /api/orders — список заказов с фильтрацией и пагинацией
router.get('/', ctrl.getAll);

// GET /api/orders/:id — детали заказа
router.get('/:id', ctrl.getById);

// POST /api/orders — создание заказа (менеджер, начальник_производства)
router.post('/', roleGuard('менеджер', 'начальник_производства'), ctrl.create);

// PUT /api/orders/:id — обновление заказа (менеджер, начальник_производства)
router.put('/:id', roleGuard('менеджер', 'начальник_производства'), ctrl.update);

// PATCH /api/orders/:id/status — смена статуса заказа
router.patch('/:id/status', roleGuard('менеджер', 'начальник_производства'), ctrl.changeStatus);

// DELETE /api/orders/:id — удаление заказа (только новые заказы)
router.delete('/:id', roleGuard('менеджер'), ctrl.remove);

module.exports = router;
