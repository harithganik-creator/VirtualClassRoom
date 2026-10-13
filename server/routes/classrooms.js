const express = require('express');
const router = express.Router();
const {
  getClassrooms, createClassroom, getClassroom, updateClassroom, deleteClassroom, joinClassroom, removeStudent
} = require('../controllers/classroomController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getClassrooms);
router.post('/', authorize('teacher'), createClassroom);
router.post('/join', authorize('student'), joinClassroom);
router.get('/:id', getClassroom);
router.put('/:id', authorize('teacher', 'admin'), updateClassroom);
router.delete('/:id', authorize('teacher', 'admin'), deleteClassroom);
router.delete('/:id/students/:studentId', authorize('teacher'), removeStudent);

module.exports = router;
