const express = require('express');
const router = express.Router();
const { getAIChatResponse } = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

// Allow chatting if authenticated
router.post('/chat', auth, getAIChatResponse);

module.exports = router;
