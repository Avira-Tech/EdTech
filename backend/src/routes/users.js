import express from 'express';
import { body, param } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  assignCoursesToTeacher
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User management routes (Admin only)
router.get(
  '/',
  authorize('superadmin', 'admin'),
  getUsers
);

router.get(
  '/stats',
  authorize('superadmin', 'admin'),
  getUserStats
);

router.get(
  '/:id',
  mongoIdValidation,
  validate,
  getUserById
);

router.post(
  '/',
  authorize('superadmin', 'admin'),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['admin', 'teacher', 'student']).withMessage('Invalid role')
  ],
  validate,
  createUser
);

router.put(
  '/:id',
  mongoIdValidation,
  validate,
  updateUser
);

router.delete(
  '/:id',
  authorize('superadmin'),
  mongoIdValidation,
  validate,
  deleteUser
);

router.put(
  '/:id/assign-courses',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  [
    body('courseIds').isArray({ min: 1 }).withMessage('Course IDs array is required')
  ],
  validate,
  assignCoursesToTeacher
);

export default router;

