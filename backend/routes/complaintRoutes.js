const express = require('express');
const router = express.Router();

const {
  submitComplaint,
  getComplaints,
  getMyComplaints,
  updateComplaintStatus
} = require('../controllers/complaintController');

router.post('/', submitComplaint);
router.get('/', getComplaints);
router.get('/user/:user_id', getMyComplaints);
router.put('/:id', updateComplaintStatus);

module.exports = router;
