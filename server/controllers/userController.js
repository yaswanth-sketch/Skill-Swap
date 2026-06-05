const db = require('../config/db');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT u.user_id, u.name, u.email, u.department, u.year_of_study, u.bio, u.skills_known, u.profile_pic, u.role, u.created_at, u.points,
             COUNT(DISTINCT s.skill_id) as skills_count,
             COUNT(DISTINCT CASE WHEN ses.teacher_id = u.user_id AND ses.status = 'completed' THEN ses.session_id END) as sessions_taught,
             COUNT(DISTINCT CASE WHEN ses.learner_id = u.user_id AND ses.status = 'completed' THEN ses.session_id END) as sessions_learned,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM users u
      LEFT JOIN skills s ON u.user_id = s.user_id
      LEFT JOIN sessions ses ON u.user_id = ses.teacher_id OR u.user_id = ses.learner_id
      LEFT JOIN reviews r ON r.reviewee_id = u.user_id
      WHERE u.user_id = ?
      GROUP BY u.user_id
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];
    user.avg_rating = parseFloat(user.avg_rating).toFixed(1);

    // Get user's badges
    const [badges] = await db.query(`
      SELECT b.*, ub.awarded_at
      FROM badges b
      JOIN user_badges ub ON b.badge_id = ub.badge_id
      WHERE ub.user_id = ?
    `, [req.params.id]);
    user.badges = badges;

    // Get user's skills
    const [skills] = await db.query('SELECT * FROM skills WHERE user_id = ?', [req.params.id]);
    user.skills = skills;

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department, year_of_study, bio, skills_known } = req.body;
    
    if (parseInt(req.params.id) !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db.query(
      'UPDATE users SET name = COALESCE(?, name), department = COALESCE(?, department), year_of_study = COALESCE(?, year_of_study), bio = COALESCE(?, bio), skills_known = COALESCE(?, skills_known) WHERE user_id = ?',
      [name, department, year_of_study, bio, skills_known, req.params.id]
    );

    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT u.user_id, u.name, u.department, u.profile_pic, u.points, u.max_streak,
             (SELECT JSON_ARRAYAGG(b.icon_url) FROM badges b JOIN user_badges ub ON b.badge_id = ub.badge_id WHERE ub.user_id = u.user_id) as badges,
             COUNT(DISTINCT CASE WHEN ses.teacher_id = u.user_id AND ses.status = 'completed' THEN ses.session_id END) as sessions_taught,
             COUNT(DISTINCT CASE WHEN ses.learner_id = u.user_id AND ses.status = 'completed' THEN ses.session_id END) as sessions_learned,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.review_id) as review_count
      FROM users u
      LEFT JOIN sessions ses ON u.user_id = ses.teacher_id OR u.user_id = ses.learner_id
      LEFT JOIN reviews r ON r.reviewee_id = u.user_id
      GROUP BY u.user_id
      ORDER BY u.points DESC, avg_rating DESC
      LIMIT 20
    `);

    leaderboard.forEach(u => {
      u.avg_rating = parseFloat(u.avg_rating || 0).toFixed(1);
      if (typeof u.badges === 'string') {
        try { u.badges = JSON.parse(u.badges); } catch (e) { u.badges = []; }
      }
      if (!u.badges) u.badges = [];
    });

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
};

// Get notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const [notifs] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.user_id]
    );
    res.json(notifs);
  } catch (err) {
    next(err);
  }
};

// Mark notifications as read
exports.markNotificationsRead = async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.user_id]);
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
