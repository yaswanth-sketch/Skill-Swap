const express = require('express');
const router = express.Router();
const { submitQuiz, getQuizHistory } = require('../controllers/quizController');
const { auth } = require('../middleware/auth');

router.post('/submit', auth, submitQuiz);
router.get('/history', auth, getQuizHistory);

module.exports = router;
