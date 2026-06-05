const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, deleteMessage, reactToMessage } = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/conversations', auth, getConversations);
router.get('/:userId', auth, getMessages);
router.post('/', auth, sendMessage);
router.delete('/:messageId', auth, deleteMessage);
router.post('/:messageId/react', auth, reactToMessage);

module.exports = router;
