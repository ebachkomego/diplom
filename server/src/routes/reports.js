// Маршруты отчётов и аналитики
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);

// Дашборд доступен всем авторизованным пользователям
router.get('/dashboard', ctrl.getDashboard);

// Остальные маршруты требуют специфических ролей
router.get('/orders-dynamics', roleGuard('менеджер', 'начальник_производства'), ctrl.getOrdersDynamics);
router.get('/resource-load', roleGuard('менеджер', 'начальник_производства', 'мастер'), ctrl.getResourceLoad);
router.get('/plan-fact', roleGuard('менеджер', 'начальник_производства', 'мастер'), ctrl.getPlanFact);
router.get('/order-cost/:id', roleGuard('менеджер', 'начальник_производства'), ctrl.getOrderCost);

// Конструктор графиков
router.get('/chart-builder/datasets', roleGuard('менеджер', 'начальник_производства'), ctrl.getChartBuilderDatasets);
router.post('/chart-builder/query', roleGuard('менеджер', 'начальник_производства'), ctrl.queryChartBuilder);
router.get('/chart-builder/templates', roleGuard('менеджер', 'начальник_производства'), ctrl.getChartTemplates);
router.post('/chart-builder/templates', roleGuard('менеджер', 'начальник_производства'), ctrl.createChartTemplate);
router.post('/chart-builder/init', roleGuard('менеджер', 'начальник_производства'), ctrl.initializeChartTemplates);

module.exports = router;
