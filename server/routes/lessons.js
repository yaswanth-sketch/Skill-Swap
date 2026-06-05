const express = require('express');
const router = express.Router();
const { getLessons, createLesson, getProgress, completeLesson, getLearnSkills, incrementView } = require('../controllers/lessonController');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'notes' ? 'notes-' : 'video-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/', getLessons);
router.get('/learn', auth, getLearnSkills);
router.get('/progress', auth, getProgress);
router.post('/', auth, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'notes', maxCount: 1 }]), createLesson);
router.post('/:lesson_id/complete', auth, completeLesson);
router.post('/:lesson_id/view', auth, incrementView);

module.exports = router;
