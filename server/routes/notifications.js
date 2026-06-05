const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notifController');
const { auth } = require('../middleware/auth');

router.get('/', auth, notifController.getNotifications);
router.put('/mark-all', auth, notifController.markAllAsRead);
router.put('/:id/read', auth, notifController.markAsRead);
router.delete('/:id', auth, notifController.deleteNotification);

module.exports = router;
