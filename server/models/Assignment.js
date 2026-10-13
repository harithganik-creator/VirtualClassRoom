const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentPublicId: {
      type: String,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: [1, 'Total marks must be at least 1'],
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ classroomId: 1, dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
