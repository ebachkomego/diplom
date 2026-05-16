// Маршруты клиентов
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customersController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', roleGuard('менеджер'), ctrl.create);
router.put('/:id', roleGuard('менеджер'), ctrl.update);
router.delete('/:id', roleGuard('менеджер'), ctrl.remove);

module.exports = router;
