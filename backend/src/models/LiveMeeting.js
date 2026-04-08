import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['shared_screen_with_speaker_view', 'shared_screen_with_gallery_view', 
           'speaker_view', 'gallery_view', 'audio_only', 'chat_file', 'transcript'],
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  downloadUrl: {
    type: String,
    default: null
  },
  playUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  fileExtension: {
    type: String,
    default: ''
  },
  storagePath: {
    type: String,
    default: null
  },
  localUrl: {
    type: String,
    default: null
  }
}, { _id: false });

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  joinTime: {
    type: Date,
    default: Date.now
  },
  leaveTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  role: {
    type: String,
    enum: ['host', 'participant'],
    default: 'participant'
  },
  attended: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const liveMeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: String,
    default: null
  },
  lesson: {
    type: String,
    default: null
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Zoom Integration
  zoomMeetingId: {
    type: String,
    required: true,
    unique: true
  },
  zoomPassword: {
    type: String,
    select: false
  },
  joinUrl: {
    type: String,
    required: true
  },
  startUrl: {
    type: String,
    select: false
  },
  
  // Scheduling
  scheduledStart: {
    type: Date,
    required: true
  },
  scheduledDuration: {
    type: Number, // in minutes
    default: 60
  },
  actualStart: {
    type: Date,
    default: null
  },
  actualEnd: {
    type: Date,
    default: null
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  
  // Auto-Recording Settings
  autoRecording: {
    type: String,
    enum: ['none', 'local', 'cloud'],
    default: 'cloud'
  },
  recordingConsent: {
    type: Boolean,
    default: true
  },
  
  // Recordings
  recordings: [recordingSchema],
  recordingUrls: [{
    type: String
  }],
  localRecordings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  
  // Meeting Settings
  settings: {
    waitingRoom: {
      type: Boolean,
      default: true
    },
    muteUponEntry: {
      type: Boolean,
      default: true
    },
    hostVideo: {
      type: Boolean,
      default: true
    },
    participantVideo: {
      type: Boolean,
      default: true
    },
    joinBeforeHost: {
      type: Boolean,
      default: false
    },
    registrantsEmailNotification: {
      type: Boolean,
      default: true
    },
    meetingAuthentication: {
      type: Boolean,
      default: false
    }
  },
  
  // Participants
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 100
  },
  participantCount: {
    type: Number,
    default: 0
  },
  
  // Tracking
  tracking: {
    source: {
      type: String,
      default: 'zoom'
    },
    customQuestions: [{
      field: String,
      value: String
    }]
  },
  
  // Post-meeting
  summary: {
    type: String,
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
liveMeetingSchema.index({ course: 1 });
liveMeetingSchema.index({ host: 1 });
liveMeetingSchema.index({ status: 1 });
liveMeetingSchema.index({ scheduledStart: 1 });
liveMeetingSchema.index({ 'zoomMeetingId': 1 });
liveMeetingSchema.index({ createdAt: -1 });

// Virtual for formatted duration
liveMeetingSchema.virtual('formattedDuration').get(function() {
  if (!this.scheduledDuration) return 'N/A';
  const hours = Math.floor(this.scheduledDuration / 60);
  const minutes = this.scheduledDuration % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for meeting status
liveMeetingSchema.virtual('isLive').get(function() {
  return this.status === 'live';
});

// Virtual for has recordings
liveMeetingSchema.virtual('hasRecordings').get(function() {
  return this.recordings && this.recordings.length > 0;
});

// Virtual for total recording duration
liveMeetingSchema.virtual('totalRecordingDuration').get(function() {
  if (!this.recordings || this.recordings.length === 0) return 0;
  return this.recordings.reduce((total, rec) => total + (rec.duration || 0), 0);
});

// Pre-save middleware to set published date
liveMeetingSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to get upcoming meetings
liveMeetingSchema.statics.getUpcoming = function(courseId = null) {
  const query = {
    status: 'scheduled',
    scheduledStart: { $gte: new Date() }
  };
  if (courseId) query.course = courseId;
  return this.find(query)
    .populate('host', 'firstName lastName avatar')
    .populate('course', 'title thumbnail')
    .sort({ scheduledStart: 1 });
};

// Static method to get past meetings with recordings
liveMeetingSchema.statics.getPastWithRecordings = function(courseId = null) {
  const query = {
    status: 'ended',
    'recordings.0': { $exists: true }
  };
  if (courseId) query.course = courseId;
  return this.find(query)
    .populate('host', 'firstName lastName avatar')
    .populate('course', 'title thumbnail')
    .sort({ actualEnd: -1 });
};

const LiveMeeting = mongoose.model('LiveMeeting', liveMeetingSchema);

export default LiveMeeting;

