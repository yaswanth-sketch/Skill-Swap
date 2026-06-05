const db = require('../config/db');

// Create a review
exports.createReview = async (req, res, next) => {
  try {
    const { session_id, reviewee_id, rating, comment } = req.body;
    
    if (!session_id || !reviewee_id || !rating) {
      return res.status(400).json({ error: 'session_id, reviewee_id, and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Verify session exists and user is part of it
    const [sessions] = await db.query(
      'SELECT * FROM sessions WHERE session_id = ? AND (teacher_id = ? OR learner_id = ?)',
      [session_id, req.user.user_id, req.user.user_id]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found or you are not part of this session.' });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [session_id, req.user.user_id, reviewee_id, rating, comment || null]
    );

    res.status(201).json({ message: 'Review submitted', review_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Get reviews for a user
exports.getUserReviews = async (req, res, next) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.name as reviewer_name, u.profile_pic as reviewer_pic, s.title as skill_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.user_id
      JOIN sessions ses ON r.session_id = ses.session_id
      JOIN skills s ON ses.skill_id = s.skill_id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.userId]);

    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
