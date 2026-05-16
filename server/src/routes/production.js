// Маршруты производства
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productionController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

// GET /api/production/tasks — список производственных заданий
router.get('/tasks', ctrl.getTasks);

// GET /api/production/tasks/:id — детали задания
router.get('/tasks/:id', ctrl.getTaskById);

// POST /api/production/tasks — создание задания из заказа
router.post('/tasks', roleGuard('начальник_производства'), ctrl.createTask);

// PATCH /api/production/tasks/:id/status — обновление статуса задания
router.patch('/tasks/:id/status', roleGuard('начальник_производства', 'мастер'), ctrl.updateTaskStatus);

// GET /api/production/gantt — данные для диаграммы Ганта
router.get('/gantt', ctrl.getGanttData);

// GET /api/production/stages — этапы производства
router.get('/stages', ctrl.getStages);

module.exports = router;
