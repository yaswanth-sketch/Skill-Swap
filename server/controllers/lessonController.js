const db = require('../config/db');

// Get lessons for a skill
exports.getLessons = async (req, res, next) => {
  try {
    const { skill_id } = req.query;
    let query = `
      SELECT ml.*, s.title as skill_title, u.name as creator_name
      FROM micro_lessons ml
      JOIN skills s ON ml.skill_id = s.skill_id
      JOIN users u ON ml.created_by = u.user_id
    `;
    const params = [];

    if (skill_id) {
      query += ' WHERE ml.skill_id = ?';
      params.push(skill_id);
    }
    query += ' ORDER BY ml.skill_id, ml.order_num';

    const [lessons] = await db.query(query, params);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

// Create a lesson
exports.createLesson = async (req, res, next) => {
  try {
    const { skill_id, title, content, duration_secs, order_num } = req.body;
    let content_url = req.body.content_url;
    let notes_url = req.body.notes_url || null;

    // If files are uploaded via multer
    if (req.files) {
      if (req.files['video'] && req.files['video'][0]) {
        content_url = `/uploads/${req.files['video'][0].filename}`;
      }
      if (req.files['notes'] && req.files['notes'][0]) {
        notes_url = `/uploads/${req.files['notes'][0].filename}`;
      }
    }
    
    if (!skill_id || !title) {
      return res.status(400).json({ error: 'skill_id and title are required.' });
    }

    if (!content_url) {
      return res.status(400).json({ error: 'Video file or URL is required.' });
    }

    // Check ownership of skill
    const [skills] = await db.query('SELECT user_id FROM skills WHERE skill_id = ?', [skill_id]);
    if (skills.length === 0) return res.status(404).json({ error: 'Skill not found.' });
    if (skills[0].user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Only the skill owner can add lessons.' });
    }

    const [result] = await db.query(
      'INSERT INTO micro_lessons (skill_id, created_by, title, content, content_url, notes_url, duration_secs, order_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [skill_id, req.user.user_id, title, content || null, content_url || null, notes_url, duration_secs || 0, order_num || 1]
    );

    res.status(201).json({ message: 'Lesson created', lesson_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Get user's progress
exports.getProgress = async (req, res, next) => {
  try {
    const [progress] = await db.query(`
      SELECT p.*, ml.title as lesson_title, ml.skill_id, s.title as skill_title
      FROM progress p
      JOIN micro_lessons ml ON p.lesson_id = ml.lesson_id
      JOIN skills s ON ml.skill_id = s.skill_id
      WHERE p.user_id = ?
      ORDER BY p.completed_at DESC
    `, [req.user.user_id]);

    res.json(progress);
  } catch (err) {
    next(err);
  }
};

// Mark lesson as complete
exports.completeLesson = async (req, res, next) => {
  try {
    const { lesson_id } = req.params;

    await db.query(
      `INSERT INTO progress (user_id, lesson_id, completed, completed_at) 
       VALUES (?, ?, TRUE, NOW()) 
       ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()`,
      [req.user.user_id, lesson_id]
    );

    res.json({ message: 'Lesson marked as complete' });
  } catch (err) {
    next(err);
  }
};

// Get skills with lesson counts and progress for learn page
exports.getLearnSkills = async (req, res, next) => {
  try {
    const [skills] = await db.query(`
      SELECT s.skill_id, s.title, s.category, s.level, s.prerequisite_id, 
             ps.title as prerequisite_title,
             u.name as teacher_name,
             COUNT(DISTINCT ml.lesson_id) as total_lessons,
             COUNT(DISTINCT CASE WHEN p.completed = TRUE THEN p.lesson_id END) as completed_lessons,
             (
               SELECT COUNT(*) = COUNT(CASE WHEN p2.completed = TRUE THEN 1 END)
               FROM micro_lessons ml2
               LEFT JOIN progress p2 ON ml2.lesson_id = p2.lesson_id AND p2.user_id = ?
               WHERE ml2.skill_id = s.prerequisite_id
             ) as prerequisite_completed
      FROM skills s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN skills ps ON s.prerequisite_id = ps.skill_id
      LEFT JOIN micro_lessons ml ON s.skill_id = ml.skill_id
      LEFT JOIN progress p ON ml.lesson_id = p.lesson_id AND p.user_id = ?
      GROUP BY s.skill_id
      HAVING total_lessons > 0
      ORDER BY s.title
    `, [req.user.user_id, req.user.user_id]);

    res.json(skills);
  } catch (err) {
    next(err);
  }
};

// Increment views for a lesson
exports.incrementView = async (req, res, next) => {
  try {
    const { lesson_id } = req.params;

    // 1. Increment lesson view count
    await db.query('UPDATE micro_lessons SET views = views + 1 WHERE lesson_id = ?', [lesson_id]);

    // 2. Find the teacher/creator of the lesson
    const [lessons] = await db.query('SELECT created_by FROM micro_lessons WHERE lesson_id = ?', [lesson_id]);
    if (lessons.length > 0) {
      const creator_id = lessons[0].created_by;
      
      // 3. Grant the teacher 1 point
      await db.query('UPDATE users SET points = points + 1 WHERE user_id = ?', [creator_id]);
    }

    res.json({ message: 'View recorded' });
  } catch (err) {
    next(err);
  }
};
