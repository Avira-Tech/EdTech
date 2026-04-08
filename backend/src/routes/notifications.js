import express from 'express';
import { param, query } from 'express-validator';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendLiveClassNotification,
  getEnrolledLiveMeetings
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, mongoIdValidation, paginationValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
router.get(
  '/',
  paginationValidation,
  validate,
  getMyNotifications
);

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get(
  '/unread-count',
  getUnreadCount
);

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put(
  '/:id/read',
  mongoIdValidation,
  validate,
  markAsRead
);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put(
  '/read-all',
  markAllAsRead
);

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete(
  '/:id',
  mongoIdValidation,
  validate,
  deleteNotification
);

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
router.delete(
  '/',
  deleteAllNotifications
);

// @desc    Get enrolled live meetings (for student dashboard)
// @route   GET /api/notifications/meetings/enrolled
// @access  Private (Student)
router.get(
  '/meetings/enrolled',
  getEnrolledLiveMeetings
);

// @desc    Send notification to enrolled students (teacher starts live class)
// @route   POST /api/notifications/send-live-class
// @access  Private (Teacher, Admin)
router.post(
  '/send-live-class',
  [
    query('meetingId').optional().isMongoId().withMessage('Valid meeting ID is required'),
    query('courseId').optional().isMongoId().withMessage('Valid course ID is required')
  ],
  validate,
  sendLiveClassNotification
);

export default router;

