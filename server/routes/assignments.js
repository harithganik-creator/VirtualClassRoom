const express = require('express');
const router = express.Router();
const {
  getAssignments, createAssignment, getAssignment, submitAssignment, gradeSubmission
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSubmission } = require('../config/cloudinary');

router.use(protect);
router.get('/', getAssignments);
router.post('/', authorize('teacher'), uploadSubmission.single('attachment'), createAssignment);
router.get('/:id', getAssignment);
router.post('/:id/submit', authorize('student'), uploadSubmission.single('submission'), submitAssignment);
router.put('/:id/grade', authorize('teacher'), gradeSubmission);

module.exports = router;
