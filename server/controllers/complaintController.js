const db = require('../config/db');

exports.createComplaint = async (req, res, next) => {
  try {
    const { reported_id, reason } = req.body;
    const reporter_id = req.user.user_id;

    if (!reported_id || !reason) {
      return res.status(400).json({ error: 'Reported user ID and reason are required' });
    }

    const [result] = await db.query(
      'INSERT INTO complaints (reporter_id, reported_id, reason) VALUES (?, ?, ?)',
      [reporter_id, reported_id, reason]
    );

    res.status(201).json({ message: 'Complaint submitted successfully', complaint_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const [complaints] = await db.query(`
      SELECT c.*, 
             u1.name AS reporter_name, u1.email AS reporter_email,
             u2.name AS reported_name, u2.email AS reported_email
      FROM complaints c
      JOIN users u1 ON c.reporter_id = u1.user_id
      JOIN users u2 ON c.reported_id = u2.user_id
      ORDER BY c.created_at DESC
    `);
    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query('UPDATE complaints SET status = ? WHERE complaint_id = ?', [status, req.params.id]);
    res.json({ message: 'Complaint status updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    await db.query('DELETE FROM complaints WHERE complaint_id = ?', [req.params.id]);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};
