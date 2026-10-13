const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAnnouncements);
router.post('/', authorize('teacher'), createAnnouncement);
router.put('/:id', authorize('teacher'), updateAnnouncement);
router.delete('/:id', authorize('teacher', 'admin'), deleteAnnouncement);

module.exports = router;
