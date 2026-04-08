import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project'],
    default: 'assignment'
  },
  instructions: {
    type: String,
    maxlength: [3000, 'Instructions cannot exceed 3000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  points: {
    type: Number,
    required: true,
    min: [0, 'Points cannot be negative']
  },
  passingScore: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 1,
    min: 1
  },
  timeLimit: {
    type: Number, // in minutes
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isActive: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

