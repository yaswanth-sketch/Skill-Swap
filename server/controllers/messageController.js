const db = require('../config/db');

// Get conversations for current user
exports.getConversations = async (req, res, next) => {
  try {
    const [conversations] = await db.query(`
      SELECT 
        u.user_id, u.name, u.profile_pic,
        m.body as last_message,
        m.sent_at as last_message_time,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = u.user_id AND receiver_id = ? AND is_read = FALSE) as unread_count
      FROM users u
      INNER JOIN (
        SELECT 
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
          MAX(message_id) as max_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_user_id
      ) conv ON u.user_id = conv.other_user_id
      INNER JOIN messages m ON m.message_id = conv.max_id
      ORDER BY m.sent_at DESC
    `, [req.user.user_id, req.user.user_id, req.user.user_id, req.user.user_id]);

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// Get messages between two users
exports.getMessages = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    
    const [messages] = await db.query(`
      SELECT m.*, 
             s.name as sender_name, s.profile_pic as sender_pic,
             r.name as receiver_name,
             (SELECT JSON_ARRAYAGG(JSON_OBJECT('user_id', user_id, 'emoji', emoji)) 
              FROM message_reactions WHERE message_id = m.message_id) as reactions
      FROM messages m
      JOIN users s ON m.sender_id = s.user_id
      JOIN users r ON m.receiver_id = r.user_id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.sent_at ASC
    `, [req.user.user_id, otherUserId, otherUserId, req.user.user_id]);

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, req.user.user_id]
    );

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const { createNotification } = require('../utils/notifications');

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, body } = req.body;
    const io = req.app.get('io');
    
    if (!receiver_id || !body) {
      return res.status(400).json({ error: 'receiver_id and body are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, body) VALUES (?, ?, ?)',
      [req.user.user_id, receiver_id, body]
    );

    const [msgs] = await db.query(`
      SELECT m.*, s.name as sender_name, s.profile_pic as sender_pic
      FROM messages m
      JOIN users s ON m.sender_id = s.user_id
      WHERE m.message_id = ?
    `, [result.insertId]);

    // Notify receiver
    await createNotification(io, receiver_id, `New message from ${msgs[0].sender_name}`, 'message');

    res.status(201).json(msgs[0]);
  } catch (err) {
    next(err);
  }
};

// Delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    
    // Only sender can delete
    const [result] = await db.query(
      'DELETE FROM messages WHERE message_id = ? AND sender_id = ?',
      [messageId, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Not authorized or message not found.' });
    }

    res.json({ success: true, messageId });
  } catch (err) {
    next(err);
  }
};

// React to a message
exports.reactToMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.user_id;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    // Toggle reaction: if already exists with same emoji, remove it. 
    // If exists with different emoji, update it.
    // Otherwise, insert.
    const [existing] = await db.query(
      'SELECT * FROM message_reactions WHERE message_id = ? AND user_id = ?',
      [messageId, userId]
    );

    if (existing.length > 0) {
      if (existing[0].emoji === emoji) {
        await db.query('DELETE FROM message_reactions WHERE reaction_id = ?', [existing[0].reaction_id]);
        return res.json({ action: 'removed', messageId, userId });
      } else {
        await db.query('UPDATE message_reactions SET emoji = ? WHERE reaction_id = ?', [emoji, existing[0].reaction_id]);
        return res.json({ action: 'updated', messageId, userId, emoji });
      }
    }

    await db.query(
      'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)',
      [messageId, userId, emoji]
    );

    res.status(201).json({ action: 'added', messageId, userId, emoji });
  } catch (err) {
    next(err);
  }
};
