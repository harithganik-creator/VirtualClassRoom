const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res, next) => {
  try {
    const { classroomId } = req.query;

    if (!isDBConnected()) {
      let list = mockStore.announcements;
      if (classroomId) {
        list = list.filter((a) => (a.classroomId?._id || a.classroomId) === classroomId);
      }
      return res.status(200).json({ success: true, count: list.length, announcements: list, data: list });
    }

    let query = {};
    if (classroomId) query.classroomId = classroomId;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email profileImage')
      .populate('classroomId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, announcements, data: announcements });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (teacher)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, classroomId } = req.body;

    if (!isDBConnected()) {
      const cr = mockStore.classrooms.find((c) => c._id === classroomId);
      const newAnn = {
        _id: 'ann_' + Date.now(),
        title,
        message,
        classroomId: cr ? { _id: cr._id, title: cr.title } : classroomId,
        createdBy: { _id: req.user.id, name: req.user.name },
        createdAt: new Date().toISOString(),
      };
      mockStore.announcements.unshift(newAnn);
      return res.status(201).json({ success: true, announcement: newAnn, data: newAnn });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      classroomId,
      createdBy: req.user.id,
    });

    await announcement.populate([
      { path: 'createdBy', select: 'name profileImage' },
      { path: 'classroomId', select: 'title' },
    ]);

    res.status(201).json({ success: true, announcement, data: announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (teacher)
const updateAnnouncement = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const idx = mockStore.announcements.findIndex((a) => a._id === req.params.id);
      if (idx !== -1) mockStore.announcements[idx] = { ...mockStore.announcements[idx], ...req.body };
      return res.status(200).json({ success: true, announcement: mockStore.announcements[idx] });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, announcement: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (teacher)
const deleteAnnouncement = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      mockStore.announcements = mockStore.announcements.filter((a) => a._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
