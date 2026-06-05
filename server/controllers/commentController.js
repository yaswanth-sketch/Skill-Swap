const db = require('../config/db');

// Get comments for a lesson
exports.getLessonComments = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const [comments] = await db.query(`
      SELECT c.*, u.name as user_name, u.profile_pic
      FROM lesson_comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.lesson_id = ?
      ORDER BY c.created_at DESC
    `, [lessonId]);
    
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Post a comment
exports.postComment = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { body } = req.body;
    
    if (!body) {
      return res.status(400).json({ error: 'Comment body is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO lesson_comments (lesson_id, user_id, body) VALUES (?, ?, ?)',
      [lessonId, req.user.user_id, body]
    );
    
    const [newComment] = await db.query(`
      SELECT c.*, u.name as user_name, u.profile_pic
      FROM lesson_comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);
    
    // Create an arbitrary notification for the lesson creator
    const [lessons] = await db.query('SELECT created_by, title FROM micro_lessons WHERE lesson_id = ?', [lessonId]);
    if (lessons.length > 0 && lessons[0].created_by !== req.user.user_id) {
       await db.query(
         'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
         [lessons[0].created_by, `${req.user.name} commented on your lesson: ${lessons[0].title}`, 'info']
       );
    }
    
    res.status(201).json(newComment[0]);
  } catch (err) {
    next(err);
  }
};
