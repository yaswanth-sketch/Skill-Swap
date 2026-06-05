const db = require('../config/db');

/**
 * Create a notification in DB and optionally emit via socket
 * @param {Object} io - Socket.io instance
 * @param {number} userId - Receiver user ID
 * @param {string} message - Notification text
 * @param {string} type - 'message', 'session', 'badge', 'system'
 */
exports.createNotification = async (io, userId, message, type = 'info') => {
  try {
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [userId, message, type]
    );

    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        notif_id: result.insertId,
        message,
        type,
        is_read: false,
        created_at: new Date()
      });
    }
    return result.insertId;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
