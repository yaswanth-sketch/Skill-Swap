const db = require('../config/db');

exports.submitQuiz = async (req, res, next) => {
  try {
    const { skill_id, score, total_questions } = req.body;
    const user_id = req.user.user_id;

    if (!skill_id || score === undefined || !total_questions) {
      return res.status(400).json({ error: 'Missing quiz data' });
    }

    const percentage = (score / total_questions) * 100;
    let assigned_level = 'beginner';
    if (percentage >= 80) assigned_level = 'advanced';
    else if (percentage >= 50) assigned_level = 'intermediate';

    const [result] = await db.query(
      'INSERT INTO quiz_results (user_id, skill_id, score, total_questions, assigned_level) VALUES (?, ?, ?, ?, ?)',
      [user_id, skill_id, score, total_questions, assigned_level]
    );

    // Award points for completing assessment
    await db.query('UPDATE users SET points = points + ? WHERE user_id = ?', [20, user_id]);

    res.status(201).json({
      message: 'Quiz submitted successfully',
      level: assigned_level,
      points_earned: 20
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuizHistory = async (req, res, next) => {
  try {
    const [results] = await db.query(
      'SELECT q.*, s.title as skill_title FROM quiz_results q JOIN skills s ON q.skill_id = s.skill_id WHERE q.user_id = ? ORDER BY q.created_at DESC',
      [req.user.user_id]
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};
