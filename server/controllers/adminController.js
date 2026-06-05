const db = require('../config/db');

// Get dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[skillCount]] = await db.query('SELECT COUNT(*) as count FROM skills');
    const [[sessionCount]] = await db.query('SELECT COUNT(*) as count FROM sessions');
    const [[lessonCount]] = await db.query('SELECT COUNT(*) as count FROM micro_lessons');
    const [[reviewCount]] = await db.query('SELECT COUNT(*) as count FROM reviews');
    const [[messageCount]] = await db.query('SELECT COUNT(*) as count FROM messages');

    const [recentUsers] = await db.query(
      'SELECT user_id, name, email, department, role, created_at FROM users ORDER BY created_at DESC LIMIT 10'
    );

    const [sessionsByMonth] = await db.query(`
      SELECT DATE_FORMAT(scheduled_at, '%M') as month, COUNT(*) as count 
      FROM sessions 
      WHERE scheduled_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month 
      ORDER BY MIN(scheduled_at)
    `);

    const [popularSkills] = await db.query(`
      SELECT title, COUNT(*) as count 
      FROM skills 
      GROUP BY title 
      ORDER BY count DESC 
      LIMIT 8
    `);

    const [sessionsByStatus] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM sessions 
      GROUP BY status
    `);

    const [topCategories] = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM skills 
      WHERE category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 5
    `);

    const [mostActiveUsers] = await db.query(`
      SELECT name, points, department, role 
      FROM users 
      ORDER BY points DESC 
      LIMIT 8
    `);

    const [topLessons] = await db.query(`
      SELECT ml.title, ml.views, u.name as teacher_name
      FROM micro_lessons ml
      JOIN users u ON ml.created_by = u.user_id
      ORDER BY ml.views DESC
      LIMIT 8
    `);

    const [userGrowth] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%M') as month, COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month 
      ORDER BY MIN(created_at)
    `);

    res.json({
      counts: {
        users: userCount.count,
        skills: skillCount.count,
        sessions: sessionCount.count,
        lessons: lessonCount.count,
        reviews: reviewCount.count,
        messages: messageCount.count
      },
      recentUsers,
      sessionsByStatus,
      topCategories,
      sessionsByMonth,
      popularSkills,
      mostActiveUsers,
      topLessons,
      userGrowth
    });
  } catch (err) {
    next(err);
  }
};

// Get all users (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, name, email, department, year_of_study, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (err) {
    next(err);
  }
};

// Delete user (admin) — cascade all related data
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Delete in order of dependencies
    await db.query('DELETE FROM complaints WHERE reporter_id = ? OR reported_id = ?', [userId, userId]);
    await db.query('DELETE FROM user_badges WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM progress WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM lesson_comments WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);

    // Delete reviews where this user is reviewer or reviewee
    await db.query('DELETE FROM reviews WHERE reviewer_id = ? OR reviewee_id = ?', [userId, userId]);

    // Delete sessions where this user is teacher or learner
    // First remove reviews linked to those sessions
    const [sessions] = await db.query('SELECT session_id FROM sessions WHERE teacher_id = ? OR learner_id = ?', [userId, userId]);
    if (sessions.length > 0) {
      const sessionIds = sessions.map(s => s.session_id);
      await db.query(`DELETE FROM reviews WHERE session_id IN (${sessionIds.join(',')})`);
      await db.query('DELETE FROM sessions WHERE teacher_id = ? OR learner_id = ?', [userId, userId]);
    }

    // Delete micro_lessons created by this user (lesson_comments already cascade)
    await db.query('DELETE FROM micro_lessons WHERE created_by = ?', [userId]);

    // Delete skills (skill_tags cascade, micro_lessons cascade)
    await db.query('DELETE FROM skills WHERE user_id = ?', [userId]);

    // Delete notifications
    await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);

    // Finally delete the user
    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({ message: 'User and all related data deleted successfully' });
  } catch (err) {
    next(err);
  }
};
