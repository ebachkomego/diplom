// Маршруты продукции
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productsController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

// GET /api/products — список продукции
router.get('/', ctrl.getAll);

// GET /api/products/:id — детали продукта + спецификация + этапы производства
router.get('/:id', ctrl.getById);

// POST /api/products — создание продукта
router.post('/', roleGuard('начальник_производства'), ctrl.create);

// PUT /api/products/:id — обновление продукта
router.put('/:id', roleGuard('начальник_производства'), ctrl.update);

// DELETE /api/products/:id — удаление продукта
router.delete('/:id', roleGuard('начальник_производства'), ctrl.remove);

module.exports = router;
