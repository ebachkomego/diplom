// Маршруты управления пользователями (только администратор)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);
router.use(roleGuard());  // только администратор (пустой список — проверка идёт в roleGuard)

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/toggle', ctrl.toggleActive);
router.delete('/:id', ctrl.remove);

module.exports = router;
