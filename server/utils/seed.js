require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const ScheduledClass = require('../models/ScheduledClass');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Classroom.deleteMany({}),
    ScheduledClass.deleteMany({}),
    Assignment.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@learnconnect.com',
    passwordHash: 'admin123',
    role: 'admin',
    accountStatus: 'active',
  });

  // Create teachers
  const teacher1 = await User.create({
    name: 'Dr. Sarah Johnson',
    email: 'sarah@learnconnect.com',
    passwordHash: 'teacher123',
    role: 'teacher',
    bio: 'Mathematics professor with 15 years of experience.',
    accountStatus: 'active',
  });

  const teacher2 = await User.create({
    name: 'Prof. Michael Chen',
    email: 'michael@learnconnect.com',
    passwordHash: 'teacher123',
    role: 'teacher',
    bio: 'Computer Science instructor and software engineer.',
    accountStatus: 'active',
  });

  // Create students
  const students = await User.create([
    { name: 'Alice Smith', email: 'alice@student.com', passwordHash: 'student123', role: 'student' },
    { name: 'Bob Williams', email: 'bob@student.com', passwordHash: 'student123', role: 'student' },
    { name: 'Carol Brown', email: 'carol@student.com', passwordHash: 'student123', role: 'student' },
    { name: 'David Lee', email: 'david@student.com', passwordHash: 'student123', role: 'student' },
  ]);

  console.log('👥 Created users');

  // Create classrooms
  const math101 = await Classroom.create({
    title: 'Calculus I',
    description: 'Introduction to differential and integral calculus.',
    subject: 'Mathematics',
    teacherId: teacher1._id,
    studentIds: [students[0]._id, students[1]._id, students[2]._id],
  });

  const cs101 = await Classroom.create({
    title: 'Introduction to Python',
    description: 'Learn Python programming from scratch.',
    subject: 'Computer Science',
    teacherId: teacher2._id,
    studentIds: [students[1]._id, students[2]._id, students[3]._id],
  });

  const algebra = await Classroom.create({
    title: 'Linear Algebra',
    description: 'Vectors, matrices, and linear transformations.',
    subject: 'Mathematics',
    teacherId: teacher1._id,
    studentIds: [students[0]._id, students[3]._id],
  });

  console.log('🏫 Created classrooms');

  // Create scheduled classes
  const now = new Date();
  await ScheduledClass.create([
    {
      title: 'Derivatives & Limits',
      classroomId: math101._id,
      teacherId: teacher1._id,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      status: 'scheduled',
    },
    {
      title: 'Python Variables & Data Types',
      classroomId: cs101._id,
      teacherId: teacher2._id,
      startTime: new Date(now.getTime() - 30 * 60 * 1000),
      endTime: new Date(now.getTime() + 30 * 60 * 1000),
      status: 'live',
    },
    {
      title: 'Integration Techniques',
      classroomId: math101._id,
      teacherId: teacher1._id,
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      status: 'scheduled',
    },
  ]);

  // Create assignments
  await Assignment.create([
    {
      title: 'Calculus Problem Set 1',
      description: 'Solve problems on limits and continuity. Show all work.',
      classroomId: math101._id,
      teacherId: teacher1._id,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
    },
    {
      title: 'Python Hello World Project',
      description: 'Write a Python program that greets the user by name.',
      classroomId: cs101._id,
      teacherId: teacher2._id,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      totalMarks: 50,
    },
    {
      title: 'Matrix Operations Quiz',
      description: 'Complete the matrix operations worksheet.',
      classroomId: algebra._id,
      teacherId: teacher1._id,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      totalMarks: 75,
    },
  ]);

  // Create announcements
  await Announcement.create([
    {
      title: 'Welcome to Calculus I!',
      message: 'Hello everyone! Please review chapters 1-3 before our first live session. Looking forward to a great semester!',
      classroomId: math101._id,
      createdBy: teacher1._id,
    },
    {
      title: 'Python Development Environment Setup',
      message: 'Please install Python 3.11 and VS Code before the next class. I have posted a setup guide in the materials section.',
      classroomId: cs101._id,
      createdBy: teacher2._id,
    },
  ]);

  console.log('📢 Created classes, assignments, and announcements');
  console.log('\n✅ Seed data created successfully!\n');
  console.log('📋 Login credentials:');
  console.log('  Admin:   admin@learnconnect.com / admin123');
  console.log('  Teacher: sarah@learnconnect.com / teacher123');
  console.log('  Teacher: michael@learnconnect.com / teacher123');
  console.log('  Student: alice@student.com / student123');
  console.log('  Student: bob@student.com / student123\n');

  process.exit(0);
};

seedData().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
