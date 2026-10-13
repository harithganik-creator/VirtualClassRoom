const mongoose = require('mongoose');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/token');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    const allowedRoles = ['student', 'teacher'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be student or teacher.' });
    }

    if (isDBConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email,
        passwordHash: password,
        role: role || 'student',
      });

      return sendTokenResponse(user, 201, res);
    }

    // In-memory fallback
    const existing = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newUser = {
      _id: 'usr_' + Date.now(),
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      role: role || 'student',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
    };
    mockStore.users.push(newUser);
    return sendTokenResponse(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (isDBConnected()) {
      const user = await User.findOne({ email }).select('+passwordHash');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.accountStatus !== 'active') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });
      }

      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      return sendTokenResponse(user, 200, res);
    }

    // In-memory fallback
    const user = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const user = await User.findById(req.user.id);
      return res.status(200).json({ success: true, user });
    }
    const user = mockStore.users.find((u) => u._id === req.user.id || u.id === req.user.id);
    return res.status(200).json({ success: true, user: user || req.user });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout };
