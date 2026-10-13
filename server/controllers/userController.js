const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const user = mockStore.users.find((u) => u._id === req.user.id || u.id === req.user.id);
      return res.status(200).json({ success: true, user: user || req.user });
    }

    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, phone } = req.body;

    if (!isDBConnected()) {
      const user = mockStore.users.find((u) => u._id === req.user.id || u.id === req.user.id);
      if (user) {
        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (phone) user.phone = phone;
        if (req.file) user.profileImage = req.file.path;
      }
      return res.status(200).json({ success: true, user: user || req.user });
    }

    const updateData = { name, bio, phone };
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const list = mockStore.notifications.filter(
        (n) => n.recipientId === req.user.id || n.recipientId === 'all'
      );
      return res.status(200).json({ success: true, count: list.length, notifications: list, data: list });
    }

    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: notifications.length, notifications, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const notif = mockStore.notifications.find((n) => n._id === req.params.id);
      if (notif) notif.readAt = new Date().toISOString();
      return res.status(200).json({ success: true, notification: notif });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { readAt: Date.now() },
      { new: true }
    );

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
const markAllNotificationsRead = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      mockStore.notifications.forEach((n) => {
        if (n.recipientId === req.user.id) n.readAt = new Date().toISOString();
      });
      return res.status(200).json({ success: true, message: 'All marked as read' });
    }

    await Notification.updateMany(
      { recipientId: req.user.id, readAt: null },
      { readAt: Date.now() }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
