import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  getRecordings,
  downloadRecording,
  storeRecording,
  startMeeting,
  endMeeting,
  webhookHandler,
  getUpcomingMeetings,
  getPastMeetings,
  publishMeeting,
  addParticipant,
  getMeetingStats
} from '../controllers/meetingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeHierarchy } from '../middleware/role.js';
import { validate, mongoIdValidation, paginationValidation } from '../middleware/validate.js';

const router = express.Router();

// Webhook endpoint (public - verified by Zoom signature)
router.post(
  '/webhook',
  webhookHandler
);

// All other routes require authentication
router.use(authenticate);

// @desc    Get meeting statistics
// @route   GET /api/meetings/stats
// @access  Private (Admin, Teacher)
router.get(
  '/stats',
  authorizeHierarchy('teacher'),
  getMeetingStats
);

// @desc    Get upcoming meetings
// @route   GET /api/meetings/upcoming
// @access  Private
router.get(
  '/upcoming',
  getUpcomingMeetings
);

// @desc    Get past meetings with recordings
// @route   GET /api/meetings/past
// @access  Private
router.get(
  '/past',
  paginationValidation,
  validate,
  getPastMeetings
);

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
router.get(
  '/',
  paginationValidation,
  validate,
  getMeetings
);

// @desc    Get meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
router.get(
  '/:id',
  mongoIdValidation,
  validate,
  getMeetingById
);

// @desc    Create new meeting
// @route   POST /api/meetings
// @access  Private (Admin, Teacher)
router.post(
  '/',
  authorizeHierarchy('teacher'),
  [
    body('title').trim().notEmpty().withMessage('Meeting title is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('scheduledStart').isISO8601().withMessage('Valid start time is required'),
    body('scheduledDuration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
  ],
  validate,
  createMeeting
);

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private (Admin, Teacher - host only)
router.put(
  '/:id',
  mongoIdValidation,
  validate,
  updateMeeting
);

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Admin, Teacher - host only)
router.delete(
  '/:id',
  mongoIdValidation,
  validate,
  deleteMeeting
);

// @desc    Join meeting
// @route   POST /api/meetings/:id/join
// @access  Private
router.post(
  '/:id/join',
  mongoIdValidation,
  validate,
  joinMeeting
);

// @desc    Start meeting
// @route   POST /api/meetings/:id/start
// @access  Private (Host only)
router.post(
  '/:id/start',
  mongoIdValidation,
  validate,
  startMeeting
);

// @desc    End meeting
// @route   POST /api/meetings/:id/end
// @access  Private (Host only)
router.post(
  '/:id/end',
  mongoIdValidation,
  validate,
  endMeeting
);

// @desc    Publish/Unpublish meeting
// @route   PUT /api/meetings/:id/publish
// @access  Private (Admin, Teacher - host only)
router.put(
  '/:id/publish',
  mongoIdValidation,
  [
    body('publish').isBoolean().withMessage('Publish flag is required')
  ],
  validate,
  publishMeeting
);

// @desc    Get meeting recordings
// @route   GET /api/meetings/:id/recordings
// @access  Private
router.get(
  '/:id/recordings',
  mongoIdValidation,
  validate,
  getRecordings
);

// @desc    Download recording
// @route   POST /api/meetings/:id/recordings/:recordingId/download
// @access  Private (Admin, Teacher)
router.post(
  '/:id/recordings/:recordingId/download',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  downloadRecording
);

// @desc    Store recording locally
// @route   POST /api/meetings/:id/recordings/:recordingId/store
// @access  Private (Admin, Teacher)
router.post(
  '/:id/recordings/:recordingId/store',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  storeRecording
);

// @desc    Add participant manually
// @route   POST /api/meetings/:id/participants
// @access  Private (Host only)
router.post(
  '/:id/participants',
  [
    body('userId').notEmpty().withMessage('User ID is required')
  ],
  validate,
  addParticipant
);

export default router;

