const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { classroomId } = req.query;

    if (!isDBConnected()) {
      let list = mockStore.assignments;
      if (classroomId) {
        list = list.filter((a) => (a.classroomId?._id || a.classroomId) === classroomId);
      }
      if (req.user.role === 'student') {
        const studentSubs = mockStore.submissions.filter((s) => (s.studentId?._id || s.studentId) === req.user.id);
        const subMap = {};
        studentSubs.forEach((s) => {
          subMap[s.assignmentId] = s;
        });
        list = list.map((a) => ({
          ...a,
          submission: subMap[a._id] || null,
        }));
      }
      return res.status(200).json({ success: true, count: list.length, assignments: list, data: list });
    }

    let query = {};
    if (classroomId) query.classroomId = classroomId;

    if (req.user.role === 'teacher') {
      query.teacherId = req.user.id;
    } else if (req.user.role === 'student') {
      if (!classroomId) {
        const enrolledClassrooms = await Classroom.find({ studentIds: req.user.id }).select('_id');
        query.classroomId = { $in: enrolledClassrooms.map((c) => c._id) };
      }
    }

    const assignments = await Assignment.find(query)
      .populate('teacherId', 'name profileImage')
      .populate('classroomId', 'title subject')
      .sort({ dueDate: 1 });

    if (req.user.role === 'student') {
      const assignmentIds = assignments.map((a) => a._id);
      const submissions = await Submission.find({
        assignmentId: { $in: assignmentIds },
        studentId: req.user.id,
      });

      const submissionMap = {};
      submissions.forEach((s) => {
        submissionMap[s.assignmentId.toString()] = s;
      });

      const result = assignments.map((a) => ({
        ...a.toObject(),
        submission: submissionMap[a._id.toString()] || null,
      }));

      return res.status(200).json({ success: true, count: result.length, assignments: result, data: result });
    }

    res.status(200).json({ success: true, count: assignments.length, assignments, data: assignments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (teacher)
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, classroomId, dueDate, totalMarks } = req.body;

    if (!isDBConnected()) {
      const cr = mockStore.classrooms.find((c) => c._id === classroomId);
      const newAssign = {
        _id: 'assign_' + Date.now(),
        title,
        description,
        classroomId: cr ? { _id: cr._id, title: cr.title, subject: cr.subject } : classroomId,
        teacherId: { _id: req.user.id, name: req.user.name },
        dueDate: dueDate || new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        totalMarks: Number(totalMarks) || 100,
        attachmentUrl: req.file ? req.file.path : '',
        createdAt: new Date().toISOString(),
      };
      mockStore.assignments.unshift(newAssign);
      return res.status(201).json({ success: true, assignment: newAssign, data: newAssign });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      classroomId,
      teacherId: req.user.id,
      dueDate,
      totalMarks,
      attachmentUrl: req.file ? req.file.path : '',
      attachmentPublicId: req.file ? req.file.filename : '',
    });

    await assignment.populate([
      { path: 'teacherId', select: 'name profileImage' },
      { path: 'classroomId', select: 'title subject' },
    ]);

    res.status(201).json({ success: true, assignment, data: assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const assignment = mockStore.assignments.find((a) => a._id === req.params.id);
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      const submission = mockStore.submissions.find(
        (s) => s.assignmentId === req.params.id && (s.studentId?._id || s.studentId) === req.user.id
      ) || null;
      const submissions = mockStore.submissions.filter((s) => s.assignmentId === req.params.id);
      return res.status(200).json({ success: true, assignment, submission, submissions });
    }

    const assignment = await Assignment.findById(req.params.id)
      .populate('teacherId', 'name profileImage')
      .populate('classroomId', 'title subject');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submission = null;
    if (req.user.role === 'student') {
      submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id,
      });
    }

    let submissions = [];
    if (req.user.role === 'teacher' && assignment.teacherId._id.toString() === req.user.id) {
      submissions = await Submission.find({ assignmentId: assignment._id })
        .populate('studentId', 'name email profileImage');
    }

    res.status(200).json({ success: true, assignment, submission, submissions });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (student)
const submitAssignment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload your submission file' });
    }

    if (!isDBConnected()) {
      const assign = mockStore.assignments.find((a) => a._id === req.params.id);
      const newSub = {
        _id: 'sub_' + Date.now(),
        assignmentId: req.params.id,
        studentId: { _id: req.user.id, name: req.user.name, email: req.user.email },
        submissionUrl: req.file ? req.file.path || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : '',
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        isLate: assign ? new Date() > new Date(assign.dueDate) : false,
      };
      mockStore.submissions.push(newSub);
      return res.status(201).json({ success: true, submission: newSub });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await Submission.create({
      assignmentId: req.params.id,
      studentId: req.user.id,
      submissionUrl: req.file.path,
      submissionPublicId: req.file.filename,
      isLate,
      status: 'submitted',
    });

    res.status(201).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/:id/grade
// @access  Private (teacher)
const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId, marks, feedback } = req.body;

    if (!isDBConnected()) {
      const sub = mockStore.submissions.find((s) => s._id === submissionId);
      if (sub) {
        sub.marks = Number(marks);
        sub.feedback = feedback;
        sub.status = 'graded';
      }
      return res.status(200).json({ success: true, submission: sub });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { marks, feedback, status: 'graded' },
      { new: true }
    ).populate('studentId', 'name email');

    res.status(200).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAssignments, createAssignment, getAssignment, submitAssignment, gradeSubmission };
