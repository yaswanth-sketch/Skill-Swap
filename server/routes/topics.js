const express = require('express');
const router = express.Router();
const { getTopics, getTopicLessons, getTopicTeachers } = require('../controllers/topicController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getTopics);
router.get('/:topicName/lessons', auth, getTopicLessons);
router.get('/:topicName/teachers', auth, getTopicTeachers);

module.exports = router;
