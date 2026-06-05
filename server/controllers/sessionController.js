const db = require('../config/db');
const { createNotification } = require('../utils/notifications');

// Book a session
exports.bookSession = async (req, res, next) => {
  try {
    const { skill_id, teacher_id, scheduled_at, duration_mins, notes } = req.body;
    const io = req.app.get('io');
    
    if (!skill_id || !teacher_id || !scheduled_at) {
      return res.status(400).json({ error: 'skill_id, teacher_id, and scheduled_at are required.' });
    }

    if (teacher_id === req.user.user_id) {
      return res.status(400).json({ error: 'Cannot book a session with yourself.' });
    }

    const [result] = await db.query(
      'INSERT INTO sessions (teacher_id, learner_id, skill_id, scheduled_at, duration_mins, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [teacher_id, req.user.user_id, skill_id, scheduled_at, duration_mins || 60, notes || null]
    );

    // Create real-time notification for teacher
    await createNotification(io, teacher_id, `${req.user.name} requested a learning session!`, 'session');

    res.status(201).json({ message: 'Session booked', session_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Get user's sessions (as teacher or learner)
exports.getMySessions = async (req, res, next) => {
  try {
    const [sessions] = await db.query(`
      SELECT ses.*, 
             s.title as skill_title, s.category,
             t.name as teacher_name, t.profile_pic as teacher_pic,
             l.name as learner_name, l.profile_pic as learner_pic
      FROM sessions ses
      JOIN skills s ON ses.skill_id = s.skill_id
      JOIN users t ON ses.teacher_id = t.user_id
      JOIN users l ON ses.learner_id = l.user_id
      WHERE ses.teacher_id = ? OR ses.learner_id = ?
      ORDER BY ses.scheduled_at DESC
    `, [req.user.user_id, req.user.user_id]);

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// Update session status
exports.updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const io = req.app.get('io');
    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: confirmed, completed, or cancelled.' });
    }

    const [sessions] = await db.query('SELECT * FROM sessions WHERE session_id = ?', [req.params.id]);
    if (sessions.length === 0) return res.status(404).json({ error: 'Session not found.' });

    const session = sessions[0];
    
    if (status === 'confirmed' || status === 'completed') {
      if (session.teacher_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Only the teacher can confirm or complete a session.' });
      }
    }

    if (session.teacher_id !== req.user.user_id && session.learner_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db.query('UPDATE sessions SET status = ? WHERE session_id = ?', [status, req.params.id]);

    // Notify the other party
    const notifyUser = session.teacher_id === req.user.user_id ? session.learner_id : session.teacher_id;
    await createNotification(io, notifyUser, `Your session has been ${status}!`, 'session');

    res.json({ message: `Session ${status}` });
  } catch (err) {
    next(err);
  }
};
