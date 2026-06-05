const express = require('express');
const router = express.Router();
const { bookSession, getMySessions, updateSessionStatus } = require('../controllers/sessionController');
const { auth } = require('../middleware/auth');

router.get('/my', auth, getMySessions);
router.post('/book', auth, bookSession);
router.put('/:id/status', auth, updateSessionStatus);

module.exports = router;
