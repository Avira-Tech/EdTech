import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  progress: {
    completedLessons: [{
      type: String
    }],
    quizScores: [{
      quizId: String,
      score: Number,
      attempts: Number,
      lastAttempt: Date
    }],
    assignmentScores: [{
      assignmentId: mongoose.Schema.Types.ObjectId,
      score: Number,
      feedback: String,
      submittedAt: Date,
      gradedAt: Date
    }],
    overallProgress: {
      type: Number,
      default: 0
    },
    lastAccessedLesson: {
      moduleId: String,
      lessonId: String
    }
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completionCertificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date,
      default: null
    },
    certificateId: {
      type: String,
      default: null
    }
  },
  certificate: {
    type: String,
    default: null
  },
  payment: {
    transactionId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    method: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  notes: [{
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notifications: {
    reminderEmails: {
      type: Boolean,
      default: true
    },
    progressEmails: {
      type: Boolean,
      default: true
    },
    certificateEmails: {
      type: Boolean,
      default: true
    }
  },
  refund: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    processedAt: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for queries
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });
enrollmentSchema.index({ 'progress.overallProgress': -1 });

// Virtual for completion percentage
enrollmentSchema.virtual('completionPercentage').get(function() {
  return this.progress?.overallProgress || 0;
});

// Virtual for is completed
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Method to calculate progress
enrollmentSchema.methods.calculateProgress = async function(totalLessons) {
  const completed = this.progress?.completedLessons?.length || 0;
  this.progress.overallProgress = totalLessons > 0 
    ? Math.round((completed / totalLessons) * 100) 
    : 0;
  
  if (this.progress.overallProgress >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  await this.save();
};

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  next();
});

// Static method to get student enrollments with course details
enrollmentSchema.statics.getStudentEnrollments = async function(studentId) {
  return this.find({ student: studentId })
    .populate('course', 'title thumbnail description instructor duration modules')
    .sort({ enrolledAt: -1 });
};

// Static method to get course enrollments
enrollmentSchema.statics.getCourseEnrollments = async function(courseId) {
  return this.find({ course: courseId })
    .populate('student', 'firstName lastName email avatar')
    .sort({ enrolledAt: -1 });
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;

