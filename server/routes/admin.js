const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUserRole, deleteUser } = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/stats', auth, adminOnly, getStats);
router.get('/users', auth, adminOnly, getUsers);
router.put('/users/:id/role', auth, adminOnly, updateUserRole);
router.delete('/users/:id', auth, adminOnly, deleteUser);

module.exports = router;
