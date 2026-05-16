const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/uiController');

router.use(authenticate);

router.get('/notifications', ctrl.getNotifications);
router.get('/search', ctrl.globalSearch);

module.exports = router;
