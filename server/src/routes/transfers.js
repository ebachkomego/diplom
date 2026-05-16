// Маршруты для управления передачами между цехами
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transfersController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

// Доступно для всех производственных ролей
router.get('/', roleGuard('администратор', 'начальник_производства', 'мастер', 'кладовщик'), ctrl.getAll);
router.get('/stats', roleGuard('администратор', 'начальник_производства', 'мастер'), ctrl.getStats);
router.get('/:id', roleGuard('администратор', 'начальник_производства', 'мастер', 'кладовщик'), ctrl.getById);

// Создание и управление передачами — только начальник производства и мастер
router.post('/', roleGuard('администратор', 'начальник_производства', 'мастер'), ctrl.create);
router.patch('/:id/transfer', roleGuard('администратор', 'начальник_производства', 'мастер'), ctrl.transferOut);
router.patch('/:id/receive', roleGuard('администратор', 'начальник_производства', 'мастер', 'кладовщик'), ctrl.transferIn);

module.exports = router;
