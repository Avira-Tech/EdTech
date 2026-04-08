import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'page_view',
      'course_view',
      'lesson_start',
      'lesson_complete',
      'video_progress',
      'video_complete',
      'quiz_start',
      'quiz_complete',
      'assignment_submit',
      'enrollment',
      'enrollment_complete',
      'certificate_earned',
      'search',
      'user_login',
      'user_logout'
    ],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    default: null
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    default: null
  },
  metadata: {
    // Additional event-specific data
    pageUrl: String,
    referrer: String,
    deviceType: String,
    browser: String,
    os: String,
    country: String,
    city: String,
    duration: Number, // in seconds
    progress: Number, // percentage
    score: Number, // quiz score
    searchQuery: String,
    resultsCount: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ course: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ 'metadata.deviceType': 1 });

// TTL index to automatically delete old data after 1 year
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Static methods for aggregation
analyticsSchema.statics.getDailyStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          eventType: '$eventType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        events: {
          $push: {
            type: '$_id.eventType',
            count: '$count'
          }
        },
        totalEvents: { $sum: '$count' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

analyticsSchema.statics.getCourseAnalytics = async function(courseId) {
  return this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgDuration: { $avg: '$metadata.duration' },
        avgProgress: { $avg: '$metadata.progress' }
      }
    }
  ]);
};

analyticsSchema.statics.getUserActivity = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        events: { $sum: 1 },
        lessonsCompleted: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'lesson_complete'] }, 1, 0]
          }
        },
        videosWatched: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'video_complete'] }, 1, 0]
          }
        },
        totalDuration: { $sum: '$metadata.duration' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;

