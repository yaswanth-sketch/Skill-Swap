const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getLeaderboard, getNotifications, markNotificationsRead } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.get('/notifications', auth, getNotifications);
router.put('/notifications/read', auth, markNotificationsRead);
router.get('/:id', getProfile);
router.put('/:id', auth, updateProfile);

module.exports = router;
