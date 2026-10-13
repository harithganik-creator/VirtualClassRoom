const bcrypt = require('bcryptjs');

// Seed Users
const users = [
  {
    _id: '665000000000000000000001',
    id: '665000000000000000000001',
    name: 'Admin User',
    email: 'admin@learnconnect.com',
    password: 'admin123',
    role: 'admin',
    accountStatus: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    _id: '665000000000000000000002',
    id: '665000000000000000000002',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@learnconnect.com',
    password: 'teacher123',
    role: 'teacher',
    bio: 'Mathematics and Computer Science Professor.',
    accountStatus: 'active',
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    _id: '665000000000000000000003',
    id: '665000000000000000000003',
    name: 'Prof. Michael Chen',
    email: 'michael@learnconnect.com',
    password: 'teacher123',
    role: 'teacher',
    bio: 'Physics & Applied Mechanics Researcher.',
    accountStatus: 'active',
    createdAt: new Date('2026-01-12').toISOString(),
  },
  {
    _id: '665000000000000000000004',
    id: '665000000000000000000004',
    name: 'Alice Smith',
    email: 'alice@student.com',
    password: 'student123',
    role: 'student',
    accountStatus: 'active',
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    _id: '665000000000000000000005',
    id: '665000000000000000000005',
    name: 'Bob Williams',
    email: 'bob@student.com',
    password: 'student123',
    role: 'student',
    accountStatus: 'active',
    createdAt: new Date('2026-02-05').toISOString(),
  },
];

// Seed Classrooms
const classrooms = [
  {
    _id: '665100000000000000000001',
    title: 'Advanced Calculus & Analysis',
    subject: 'Mathematics',
    description: 'Comprehensive study of multi-variable calculus, series expansions, and differential equations.',
    teacherId: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson', email: 'sarah@learnconnect.com' },
    classroomCode: 'CALC2026',
    studentIds: [
      { _id: '665000000000000000000004', name: 'Alice Smith', email: 'alice@student.com' },
      { _id: '665000000000000000000005', name: 'Bob Williams', email: 'bob@student.com' },
    ],
    status: 'active',
    createdAt: new Date('2026-02-10').toISOString(),
  },
  {
    _id: '665100000000000000000002',
    title: 'Python Programming & Algorithms',
    subject: 'Computer Science',
    description: 'Master data structures, graph search, and object-oriented paradigms using Python 3.',
    teacherId: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson', email: 'sarah@learnconnect.com' },
    classroomCode: 'PYTH2026',
    studentIds: [
      { _id: '665000000000000000000004', name: 'Alice Smith', email: 'alice@student.com' },
      { _id: '665000000000000000000005', name: 'Bob Williams', email: 'bob@student.com' },
    ],
    status: 'active',
    createdAt: new Date('2026-02-12').toISOString(),
  },
  {
    _id: '665100000000000000000003',
    title: 'Classical Mechanics & Wave Theory',
    subject: 'Physics',
    description: 'Fundamental principles of Newtonian mechanics, rotational dynamics, and oscillation harmonics.',
    teacherId: { _id: '665000000000000000000003', name: 'Prof. Michael Chen', email: 'michael@learnconnect.com' },
    classroomCode: 'PHYS2026',
    studentIds: [
      { _id: '665000000000000000000004', name: 'Alice Smith', email: 'alice@student.com' },
    ],
    status: 'active',
    createdAt: new Date('2026-02-15').toISOString(),
  },
];

// Seed Scheduled Classes
const now = Date.now();
const classes = [
  {
    _id: '665200000000000000000001',
    title: 'Differential Equations: Live Problem Solving',
    classroomId: { _id: '665100000000000000000001', title: 'Advanced Calculus & Analysis', subject: 'Mathematics' },
    teacherId: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson' },
    startTime: new Date(now - 1000 * 60 * 15).toISOString(),
    endTime: new Date(now + 1000 * 60 * 60 * 2).toISOString(),
    meetingRoomId: 'learnconnect-calc-live-room-01',
    status: 'live',
    participants: ['665000000000000000000002'],
    createdAt: new Date('2026-02-18').toISOString(),
  },
  {
    _id: '665200000000000000000002',
    title: 'Dynamic Programming & Memoization',
    classroomId: { _id: '665100000000000000000002', title: 'Python Programming & Algorithms', subject: 'Computer Science' },
    teacherId: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson' },
    startTime: new Date(now + 1000 * 60 * 60 * 24).toISOString(),
    endTime: new Date(now + 1000 * 60 * 60 * 26).toISOString(),
    meetingRoomId: 'learnconnect-python-live-room-02',
    status: 'scheduled',
    participants: [],
    createdAt: new Date('2026-02-19').toISOString(),
  },
];

// Seed Assignments
const assignments = [
  {
    _id: '665300000000000000000001',
    title: 'Problem Set 1: Vector Integrals',
    description: 'Solve problems 1-12 from Chapter 3 on line and surface integrals. Show all intermediate integration steps clearly.',
    classroomId: { _id: '665100000000000000000001', title: 'Advanced Calculus & Analysis', subject: 'Mathematics' },
    teacherId: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson' },
    dueDate: new Date(now + 1000 * 60 * 60 * 48).toISOString(),
    totalMarks: 100,
    attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: new Date('2026-02-20').toISOString(),
  },
  {
    _id: '665300000000000000000002',
    title: 'Binary Search Tree Implementation',
    description: 'Implement a balanced BST in Python with insert, search, delete, and in-order traversal methods.',
    classroomId: { _id: '665100000000000000000002', title: 'Python Programming & Algorithms', subject: 'Computer Science' },
    teacherId: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson' },
    dueDate: new Date(now + 1000 * 60 * 60 * 72).toISOString(),
    totalMarks: 50,
    createdAt: new Date('2026-02-21').toISOString(),
  },
];

// Seed Submissions
const submissions = [
  {
    _id: '665400000000000000000001',
    assignmentId: '665300000000000000000001',
    studentId: { _id: '665000000000000000000004', name: 'Alice Smith', email: 'alice@student.com' },
    submissionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submittedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    marks: 95,
    feedback: 'Excellent work on the Gauss divergence theorems! Neat proofs.',
    status: 'graded',
    isLate: false,
  },
];

// Seed Materials
const materials = [
  {
    _id: '665500000000000000000001',
    title: 'Calculus Course Syllabus & Formula Sheet',
    description: 'Reference sheet covering Laplace transforms, divergence, and trigonometric integrals.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    classroomId: { _id: '665100000000000000000001', title: 'Advanced Calculus & Analysis' },
    uploadedBy: '665000000000000000000002',
    createdAt: new Date('2026-02-10').toISOString(),
  },
  {
    _id: '665500000000000000000002',
    title: 'Python 3 Standard Library Cheat Sheet',
    description: 'Summary of collections, itertools, heapq, and functools modules.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    classroomId: { _id: '665100000000000000000002', title: 'Python Programming & Algorithms' },
    uploadedBy: '665000000000000000000002',
    createdAt: new Date('2026-02-12').toISOString(),
  },
];

// Seed Announcements
const announcements = [
  {
    _id: '665600000000000000000001',
    title: 'Welcome to Spring Term 2026!',
    message: 'Welcome everyone! Live video sessions will take place every Tuesday and Thursday on Jitsi Meet. Check the course schedule tab for upcoming links.',
    classroomId: { _id: '665100000000000000000001', title: 'Advanced Calculus & Analysis' },
    createdBy: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson' },
    createdAt: new Date('2026-02-15').toISOString(),
  },
  {
    _id: '665600000000000000000002',
    title: 'Python Lab Environment Setup',
    message: 'Please make sure Python 3.12+ and VS Code are installed before Friday’s workshop.',
    classroomId: { _id: '665100000000000000000002', title: 'Python Programming & Algorithms' },
    createdBy: { _id: '665000000000000000000002', name: 'Dr. Sarah Johnson' },
    createdAt: new Date('2026-02-16').toISOString(),
  },
];

// Seed Notifications
const notifications = [
  {
    _id: '665700000000000000000001',
    recipientId: '665000000000000000000004',
    title: 'Assignment Graded',
    message: 'Your submission for "Problem Set 1: Vector Integrals" has been graded: 95/100',
    type: 'grade',
    readAt: null,
    createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
  },
  {
    _id: '665700000000000000000002',
    recipientId: '665000000000000000000004',
    title: 'New Live Class Scheduled',
    message: 'New session "Differential Equations: Live Problem Solving" starts soon.',
    type: 'class',
    readAt: null,
    createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
  },
];

module.exports = {
  users,
  classrooms,
  classes,
  assignments,
  submissions,
  materials,
  announcements,
  notifications,
};
