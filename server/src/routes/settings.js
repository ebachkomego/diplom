const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(authenticate);
router.use(roleGuard('администратор'));

router.get('/notification-email', ctrl.getNotificationEmail);
router.put('/notification-email', ctrl.updateNotificationEmail);

module.exports = router;
