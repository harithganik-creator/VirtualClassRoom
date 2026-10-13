const mongoose = require('mongoose');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get all classrooms
// @route   GET /api/classrooms
// @access  Private
const getClassrooms = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    if (!isDBConnected()) {
      let list = mockStore.classrooms;
      if (req.user.role === 'teacher') {
        list = list.filter((c) => (c.teacherId?._id || c.teacherId) === req.user.id);
      } else if (req.user.role === 'student') {
        list = list.filter((c) =>
          c.studentIds?.some((s) => (s._id || s) === req.user.id)
        );
      }
      if (search) {
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.subject.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res.status(200).json({
        success: true,
        count: list.length,
        total: list.length,
        pages: 1,
        classrooms: list,
        data: list,
      });
    }

    let query = {};
    if (req.user.role === 'teacher') {
      query.teacherId = req.user.id;
    } else if (req.user.role === 'student') {
      query.studentIds = req.user.id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Classroom.countDocuments(query);
    const classrooms = await Classroom.find(query)
      .populate('teacherId', 'name email profileImage')
      .populate('studentIds', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: classrooms.length,
      total,
      pages: Math.ceil(total / limit),
      classrooms,
      data: classrooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create classroom
// @route   POST /api/classrooms
// @access  Private (teacher)
const createClassroom = async (req, res, next) => {
  try {
    const { title, description, subject } = req.body;

    if (!isDBConnected()) {
      const newClassroom = {
        _id: 'cls_' + Date.now(),
        title,
        description,
        subject: subject || 'General',
        teacherId: { _id: req.user.id, name: req.user.name, email: req.user.email },
        classroomCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        studentIds: [],
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      mockStore.classrooms.unshift(newClassroom);
      return res.status(201).json({ success: true, classroom: newClassroom, data: newClassroom });
    }

    const classroom = await Classroom.create({
      title,
      description,
      subject,
      teacherId: req.user.id,
    });

    await classroom.populate('teacherId', 'name email profileImage');
    res.status(201).json({ success: true, classroom, data: classroom });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single classroom
// @route   GET /api/classrooms/:id
// @access  Private
const getClassroom = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const classroom = mockStore.classrooms.find((c) => c._id === req.params.id);
      if (!classroom) {
        return res.status(404).json({ success: false, message: 'Classroom not found' });
      }
      return res.status(200).json({ success: true, classroom, data: classroom });
    }

    const classroom = await Classroom.findById(req.params.id)
      .populate('teacherId', 'name email bio profileImage')
      .populate('studentIds', 'name email profileImage');

    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    res.status(200).json({ success: true, classroom, data: classroom });
  } catch (error) {
    next(error);
  }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private (teacher)
const updateClassroom = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const idx = mockStore.classrooms.findIndex((c) => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Classroom not found' });
      mockStore.classrooms[idx] = { ...mockStore.classrooms[idx], ...req.body };
      return res.status(200).json({ success: true, classroom: mockStore.classrooms[idx] });
    }

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    if (classroom.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teacherId', 'name email');

    res.status(200).json({ success: true, classroom: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (teacher/admin)
const deleteClassroom = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      mockStore.classrooms = mockStore.classrooms.filter((c) => c._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Classroom deleted' });
    }

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    if (classroom.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Classroom.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Join classroom via code
// @route   POST /api/classrooms/join
// @access  Private (student)
const joinClassroom = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a classroom code' });
    }

    if (!isDBConnected()) {
      const classroom = mockStore.classrooms.find(
        (c) => c.classroomCode?.toUpperCase() === code.trim().toUpperCase()
      );
      if (!classroom) {
        return res.status(404).json({ success: false, message: 'Invalid classroom code' });
      }

      if (!classroom.studentIds.some((s) => (s._id || s) === req.user.id)) {
        classroom.studentIds.push({ _id: req.user.id, name: req.user.name, email: req.user.email });
      }
      return res.status(200).json({ success: true, classroom, data: classroom });
    }

    const classroom = await Classroom.findOne({
      classroomCode: code.trim().toUpperCase(),
    });

    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Invalid classroom code' });
    }

    if (classroom.studentIds.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this classroom' });
    }

    classroom.studentIds.push(req.user.id);
    await classroom.save();

    await Notification.create({
      recipientId: classroom.teacherId,
      title: 'New Student Joined',
      message: `${req.user.name} joined your classroom "${classroom.title}"`,
      type: 'class',
    });

    res.status(200).json({ success: true, classroom, data: classroom });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove student
// @route   DELETE /api/classrooms/:id/students/:studentId
// @access  Private (teacher)
const removeStudent = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const cls = mockStore.classrooms.find((c) => c._id === req.params.id);
      if (cls) {
        cls.studentIds = cls.studentIds.filter((s) => (s._id || s) !== req.params.studentId);
      }
      return res.status(200).json({ success: true, message: 'Student removed' });
    }

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    classroom.studentIds = classroom.studentIds.filter(
      (id) => id.toString() !== req.params.studentId
    );
    await classroom.save();

    res.status(200).json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClassrooms,
  createClassroom,
  getClassroom,
  updateClassroom,
  deleteClassroom,
  joinClassroom,
  removeStudent,
};
