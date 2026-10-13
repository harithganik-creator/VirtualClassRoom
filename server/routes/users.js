const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, getNotifications, markNotificationRead, markAllNotificationsRead
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', uploadProfile.single('profileImage'), updateProfile);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
