// Маршруты ресурсов (оборудование)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/resourcesController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', roleGuard('начальник_производства'), ctrl.create);
router.put('/:id', roleGuard('начальник_производства'), ctrl.update);
router.delete('/:id', roleGuard('начальник_производства'), ctrl.remove);

module.exports = router;
