const db = require('../config/db');

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

exports.markAsRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND notif_id = ?',
      [req.user.user_id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.user_id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE user_id = ? AND notif_id = ?',
      [req.user.user_id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
