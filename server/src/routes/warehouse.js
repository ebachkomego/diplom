// Маршруты складского учёта
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/warehouseController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

// GET /api/warehouse — список остатков (материалы и продукция)
router.get('/', ctrl.getAll);

// GET /api/warehouse/materials — только материалы
router.get('/materials', ctrl.getMaterials);

// GET /api/warehouse/products — только готовая продукция
router.get('/products', ctrl.getProducts);

// GET /api/warehouse/low-stock — позиции с критическим уровнем остатков
router.get('/low-stock', ctrl.getLowStock);

// POST /api/warehouse/receive — приход товара на склад
router.post('/receive', roleGuard('кладовщик', 'начальник_производства'), ctrl.receive);

// POST /api/warehouse/issue — расход товара со склада
router.post('/issue', roleGuard('кладовщик', 'начальник_производства'), ctrl.issue);

module.exports = router;
