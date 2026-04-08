import express from 'express';
import { body, param } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  addActivity,
  updateStatus,
  convertToUser,
  getLeadStats
} from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Superadmin/Admin only routes
router.get('/', authorize('superadmin', 'admin'), getLeads);
router.get('/stats', authorize('superadmin', 'admin'), getLeadStats);

router.get('/:id', authorize('superadmin', 'admin'), mongoIdValidation, validate, getLeadById);

router.post(
  '/',
  authorize('superadmin', 'admin'),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  validate,
  createLead
);

router.put(
  '/:id',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  validate,
  updateLead
);

router.delete(
  '/:id',
  authorize('superadmin'),
  mongoIdValidation,
  validate,
  deleteLead
);

// Add note to lead
router.post(
  '/:id/notes',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  [
    body('text').trim().notEmpty().withMessage('Note text is required')
  ],
  validate,
  addNote
);

// Add activity to lead
router.post(
  '/:id/activities',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  [
    body('type').isIn(['email', 'call', 'meeting', 'note', 'status-change']).withMessage('Invalid activity type'),
    body('description').trim().notEmpty().withMessage('Description is required')
  ],
  validate,
  addActivity
);

// Update lead status
router.put(
  '/:id/status',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  [
    body('status').isIn(['new', 'contacted', 'qualified', 'converted', 'lost', 'unsubscribed']).withMessage('Invalid status')
  ],
  validate,
  updateStatus
);

// Convert lead to user
router.post(
  '/:id/convert',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  validate,
  convertToUser
);

export default router;

