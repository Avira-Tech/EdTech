import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [2000, 'Question cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'fill-blank', 'matching'],
    required: true
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
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    explanation: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed // For non-MC questions
  },
  explanation: {
    type: String,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  points: {
    type: Number,
    default: 1,
    min: [0, 'Points cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  usedInQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  timesUsed: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ course: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;

