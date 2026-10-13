const mongoose = require('mongoose');
const ScheduledClass = require('../models/ScheduledClass');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get classes
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res, next) => {
  try {
    const { classroomId, status } = req.query;

    if (!isDBConnected()) {
      let list = mockStore.classes;
      if (classroomId) {
        list = list.filter((c) => (c.classroomId?._id || c.classroomId) === classroomId);
      }
      if (status) {
        list = list.filter((c) => c.status === status);
      }
      return res.status(200).json({ success: true, count: list.length, classes: list, data: list });
    }

    let query = {};
    if (classroomId) query.classroomId = classroomId;
    if (status) query.status = status;

    if (req.user.role === 'student') {
      const enrolledClassrooms = await Classroom.find({ studentIds: req.user.id }).select('_id');
      const classroomIds = enrolledClassrooms.map((c) => c._id);
      query.classroomId = { $in: classroomIds };
      if (classroomId) query.classroomId = classroomId;
    } else if (req.user.role === 'teacher') {
      query.teacherId = req.user.id;
      if (classroomId) query.classroomId = classroomId;
    }

    const classes = await ScheduledClass.find(query)
      .populate('classroomId', 'title subject')
      .populate('teacherId', 'name profileImage')
      .sort({ startTime: 1 });

    const now = new Date();
    for (const cls of classes) {
      if (cls.status === 'scheduled' && new Date(cls.startTime) <= now && new Date(cls.endTime) > now) {
        cls.status = 'live';
        await cls.save();
      } else if (cls.status !== 'cancelled' && new Date(cls.endTime) <= now) {
        cls.status = 'completed';
        await cls.save();
      }
    }

    res.status(200).json({ success: true, count: classes.length, classes, data: classes });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a class
// @route   POST /api/classes
// @access  Private (teacher)
const scheduleClass = async (req, res, next) => {
  try {
    const { title, description, classroomId, startTime, endTime } = req.body;

    if (!isDBConnected()) {
      const cr = mockStore.classrooms.find((c) => c._id === classroomId);
      const newClass = {
        _id: 'cls_session_' + Date.now(),
        title,
        description,
        classroomId: cr ? { _id: cr._id, title: cr.title, subject: cr.subject } : classroomId,
        teacherId: { _id: req.user.id, name: req.user.name },
        startTime,
        endTime,
        meetingRoomId: 'learnconnect-' + Math.random().toString(36).substring(2, 12),
        status: new Date(startTime) <= new Date() ? 'live' : 'scheduled',
        participants: [req.user.id],
        createdAt: new Date().toISOString(),
      };
      mockStore.classes.unshift(newClass);
      return res.status(201).json({ success: true, class: newClass, data: newClass });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const scheduledClass = await ScheduledClass.create({
      title,
      description,
      classroomId,
      teacherId: req.user.id,
      startTime,
      endTime,
    });

    for (const studentId of classroom.studentIds) {
      await Notification.create({
        recipientId: studentId,
        title: 'New Class Scheduled',
        message: `Class "${title}" scheduled for ${classroom.title}`,
        type: 'class',
      });
    }

    await scheduledClass.populate([
      { path: 'teacherId', select: 'name profileImage' },
      { path: 'classroomId', select: 'title subject' },
    ]);

    res.status(201).json({ success: true, class: scheduledClass, data: scheduledClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (teacher)
const updateClass = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const idx = mockStore.classes.findIndex((c) => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Class not found' });
      mockStore.classes[idx] = { ...mockStore.classes[idx], ...req.body };
      return res.status(200).json({ success: true, class: mockStore.classes[idx] });
    }

    const scheduledClass = await ScheduledClass.findById(req.params.id);
    if (!scheduledClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    if (scheduledClass.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await ScheduledClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('classroomId', 'title subject');

    res.status(200).json({ success: true, class: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (teacher)
const deleteClass = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      mockStore.classes = mockStore.classes.filter((c) => c._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Class deleted successfully' });
    }

    const scheduledClass = await ScheduledClass.findById(req.params.id);
    if (!scheduledClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    if (scheduledClass.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await ScheduledClass.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a class
// @route   POST /api/classes/:id/join
// @access  Private
const joinClass = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const cls = mockStore.classes.find((c) => c._id === req.params.id);
      if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
      return res.status(200).json({
        success: true,
        meetingRoomId: cls.meetingRoomId,
        class: cls,
      });
    }

    const scheduledClass = await ScheduledClass.findById(req.params.id);
    if (!scheduledClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (!scheduledClass.participants.includes(req.user.id)) {
      scheduledClass.participants.push(req.user.id);
      await scheduledClass.save();
    }

    res.status(200).json({
      success: true,
      meetingRoomId: scheduledClass.meetingRoomId,
      class: scheduledClass,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClasses, scheduleClass, updateClass, deleteClass, joinClass };
