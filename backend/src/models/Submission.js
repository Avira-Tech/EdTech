import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  attemptNumber: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'grading', 'graded', 'returned', 'late'],
    default: 'submitted'
  },
  score: {
    type: Number,
    default: null,
    min: 0
  },
  maxScore: {
    type: Number,
    default: 100
  },
  percentage: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  gradeHistory: [{
    score: Number,
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound unique index for student-assignment-attempt
submissionSchema.index({ assignment: 1, student: 1, attemptNumber: 1 }, { unique: true });

// Indexes
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });

// Calculate percentage before saving
submissionSchema.pre('save', function(next) {
  if (this.score !== null && this.maxScore > 0) {
    this.percentage = (this.score / this.maxScore) * 100;
  }
  next();
});

// Check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isModified('submittedAt') || this.isNew) {
    const assignment = await mongoose.model('Assignment').findById(this.assignment);
    if (assignment && this.submittedAt > assignment.dueDate) {
      this.isLate = true;
      this.status = 'late';
    }
  }
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

