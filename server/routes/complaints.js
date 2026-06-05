const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/', auth, createComplaint);
router.get('/', auth, adminOnly, getComplaints);
router.put('/:id', auth, adminOnly, updateComplaintStatus);
router.delete('/:id', auth, adminOnly, deleteComplaint);

module.exports = router;
