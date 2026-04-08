import express from 'express';
import { param, query } from 'express-validator';
import {
  trackEvent,
  getDashboardAnalytics,
  getCourseAnalytics,
  getStudentAnalytics,
  getTeacherAnalytics,
  getPlatformAnalytics
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Track analytics event (can be called by any authenticated user)
router.post('/track', trackEvent);

// Dashboard analytics (Admin/Superadmin)
router.get(
  '/dashboard',
  authorize('superadmin', 'admin'),
  getDashboardAnalytics
);

// Platform analytics (Superadmin only)
router.get(
  '/platform',
  authorize('superadmin'),
  getPlatformAnalytics
);

// Course analytics (Admin/Teacher)
router.get(
  '/courses/:id',
  authorize('superadmin', 'admin', 'teacher'),
  mongoIdValidation,
  validate,
  getCourseAnalytics
);

// Student analytics (Admin/Teacher - or student for their own data)
router.get(
  '/students/:id',
  mongoIdValidation,
  validate,
  getStudentAnalytics
);

// Teacher analytics (Admin/Teacher - or teacher for their own data)
router.get(
  '/teachers/:id',
  mongoIdValidation,
  validate,
  getTeacherAnalytics
);

export default router;

