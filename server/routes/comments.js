const express = require('express');
const router = express.Router();
const { getLessonComments, postComment } = require('../controllers/commentController');
const { auth } = require('../middleware/auth');

router.get('/:lessonId', auth, getLessonComments);
router.post('/:lessonId', auth, postComment);

module.exports = router;
