import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'social-media', 'referral', 'advertisement', 'course-page', 'webinar', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost', 'unsubscribed'],
    default: 'new'
  },
  interestedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  activities: [{
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'note', 'status-change']
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  timeline: {
    type: String,
    enum: ['immediate', '1-3-months', '3-6-months', '6+months'],
    default: '1-3-months'
  },
  convertedAt: {
    type: Date
  },
  convertedToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unsubscribedAt: {
    type: Date
  },
  lastContactedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
leadSchema.index({ email: 1 }, { unique: true });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ 'interestedCourses': 1 });

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update lastContactedAt on new activity
leadSchema.pre('save', function(next) {
  if (this.isModified('activities') && this.activities.length > 0) {
    const lastActivity = this.activities[this.activities.length - 1];
    this.lastContactedAt = lastActivity.date;
  }
  next();
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;

