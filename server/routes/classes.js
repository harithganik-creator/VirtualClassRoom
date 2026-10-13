const express = require('express');
const router = express.Router();
const { getClasses, scheduleClass, updateClass, deleteClass, joinClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getClasses);
router.post('/', authorize('teacher'), scheduleClass);
router.put('/:id', authorize('teacher'), updateClass);
router.delete('/:id', authorize('teacher'), deleteClass);
router.post('/:id/join', joinClass);

module.exports = router;
