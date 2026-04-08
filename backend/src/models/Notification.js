import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'live_class_started',
      'live_class_ended',
      'course_enrolled',
      'assignment_due',
      'assignment_submitted',
      'grade_posted',
      'recording_available',
      'announcement',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveMeeting' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
    url: { type: String },
    extra: { type: mongoose.Schema.Types.Mixed }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  channel: {
    type: String,
    enum: ['in_app', 'email', 'push'],
    default: 'in_app'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for formatted time
notificationSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
});

// Mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Mark as delivered
notificationSchema.methods.markAsDelivered = async function() {
  if (!this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
    await this.save();
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to get notifications for user
notificationSchema.statics.getForUser = function(userId, options = {}) {
  const { page = 1, limit = 20, type, unreadOnly = false } = options;
  
  const query = { recipient: userId };
  if (type) query.type = type;
  if (unreadOnly) query.isRead = false;

  return this.find(query)
    .populate('sender', 'firstName lastName avatar')
    .populate('data.meetingId', 'title scheduledStart status')
    .populate('data.courseId', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to create and send notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this({
    recipient: data.recipient,
    sender: data.sender,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    channel: data.channel || 'in_app'
  });
  
  await notification.save();
  
  return this.findById(notification._id)
    .populate('sender', 'firstName lastName avatar')
    .populate('data.meetingId', 'title scheduledStart status')
    .populate('data.courseId', 'title thumbnail');
};

// Static method to send notification to multiple recipients
notificationSchema.statics.sendToMany = async function(recipients, data) {
  const notifications = recipients.map(recipient => ({
    recipient,
    sender: data.sender,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    channel: data.channel || 'in_app'
  }));

  return this.insertMany(notifications);
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

