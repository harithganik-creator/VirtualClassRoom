const mongoose = require('mongoose');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboard = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const totalUsers = mockStore.users.length;
      const totalStudents = mockStore.users.filter((u) => u.role === 'student').length;
      const totalTeachers = mockStore.users.filter((u) => u.role === 'teacher').length;
      const totalClassrooms = mockStore.classrooms.length;
      const totalAssignments = mockStore.assignments.length;
      const activeUsers = mockStore.users.filter((u) => u.accountStatus === 'active').length;
      const suspendedUsers = mockStore.users.filter((u) => u.accountStatus === 'suspended').length;
      const recentUsers = mockStore.users.slice(0, 5);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalClassrooms,
          totalAssignments,
          activeUsers,
          suspendedUsers,
        },
        recentUsers,
      });
    }

    const [totalUsers, totalStudents, totalTeachers, totalClassrooms, totalAssignments, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        Classroom.countDocuments(),
        Assignment.countDocuments(),
        User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(5),
      ]);

    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ accountStatus: 'suspended' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalClassrooms,
        totalAssignments,
        activeUsers,
        suspendedUsers,
      },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    if (!isDBConnected()) {
      let list = mockStore.users;
      if (role) list = list.filter((u) => u.role === role);
      if (status) list = list.filter((u) => u.accountStatus === status);
      if (search) {
        list = list.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res.status(200).json({
        success: true,
        count: list.length,
        total: list.length,
        pages: 1,
        users: list,
      });
    }

    let query = {};
    if (role) query.role = role;
    if (status) query.accountStatus = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!isDBConnected()) {
      const u = mockStore.users.find((user) => user._id === req.params.id || user.id === req.params.id);
      if (u) u.accountStatus = status;
      return res.status(200).json({ success: true, user: u });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus: status },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      mockStore.users = mockStore.users.filter((u) => u._id !== req.params.id && u.id !== req.params.id);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, updateUserStatus, deleteUser };
