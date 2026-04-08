import Notification from '../models/Notification.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

/**
 * Get notifications for current user
 */
export const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, unreadOnly } = req.query;

    const notifications = await Notification.getForUser(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      unreadOnly: unreadOnly === 'true'
    });

    const total = await Notification.countDocuments({ 
      recipient: req.user._id,
      ...(type && { type }),
      ...(unreadOnly === 'true' && { isRead: false })
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

/**
 * Delete all notifications for user
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });

    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
};

/**
 * Send notification to enrolled students of a course (teacher starts live class)
 */
export const sendLiveClassNotification = async (req, res) => {
  try {
    const { meetingId, courseId, message } = req.body;

    // Get all enrolled students for this course
    const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'firstName lastName email');
    
    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students enrolled in this course'
      });
    }

    const recipients = enrollments.map(e => e.student._id);

    // Create notifications for all enrolled students
    const notifications = await Notification.sendToMany(recipients, {
      recipient: recipients,
      sender: req.user._id,
      type: 'live_class_started',
      title: '🔴 Live Class Started!',
      message: message || `Your teacher has started a live class. Join now to participate!`,
      data: {
        meetingId,
        courseId,
        url: `/student/meetings/${meetingId}`
      },
      channel: 'in_app'
    });

    res.json({
      success: true,
      message: `Notifications sent to ${recipients.length} students`,
      data: {
        sentCount: recipients.length,
        notifications
      }
    });
  } catch (error) {
    console.error('Send live class notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notifications',
      error: error.message
    });
  }
};

/**
 * Get live meetings for enrolled courses (student dashboard)
 */
export const getEnrolledLiveMeetings = async (req, res) => {
  try {
    const LiveMeeting = (await import('../models/LiveMeeting.js')).default;
    const Enrollment = (await import('../models/Enrollment.js')).default;

    // Get user's enrolled courses
    const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
    const enrolledCourseIds = enrollments.map(e => e.course);

    // Get live and upcoming meetings for enrolled courses
    const meetings = await LiveMeeting.find({
      course: { $in: enrolledCourseIds },
      status: { $in: ['scheduled', 'live'] }
    })
      .populate('host', 'firstName lastName avatar')
      .populate('course', 'title thumbnail')
      .sort({ scheduledStart: 1 });

    const now = new Date();
    const liveNow = meetings.filter(m => m.status === 'live');
    const upcoming = meetings.filter(m => m.status === 'scheduled' && new Date(m.scheduledStart) > now);

    res.json({
      success: true,
      data: {
        liveNow,
        upcoming,
        all: meetings
      }
    });
  } catch (error) {
    console.error('Get enrolled live meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meetings',
      error: error.message
    });
  }
};

