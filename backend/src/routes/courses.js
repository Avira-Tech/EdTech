import express from 'express';
import { body, param } from 'express-validator';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  addModule,
  enrollStudent
} from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeHierarchy } from '../middleware/role.js';
import { validate, mongoIdValidation, paginationValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (for published courses)
router.get('/', paginationValidation, validate, getCourses);
router.get('/:id', mongoIdValidation, validate, getCourseById);

// Teacher/Admin routes
router.post(
  '/',
  authorizeHierarchy('teacher'),
  [
    body('title').trim().notEmpty().withMessage('Course title is required'),
    body('description').trim().notEmpty().withMessage('Course description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('pricing.type').isIn(['free', 'one-time', 'subscription']).withMessage('Invalid pricing type'),
    body('pricing.price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ],
  validate,
  createCourse
);

router.put(
  '/:id',
  mongoIdValidation,
  validate,
  updateCourse
);

router.delete(
  '/:id',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  deleteCourse
);

router.get(
  '/:id/stats',
  mongoIdValidation,
  validate,
  getCourseStats
);

// Module management
router.post(
  '/:id/modules',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  [
    body('title').trim().notEmpty().withMessage('Module title is required')
  ],
  validate,
  addModule
);

// Student enrollment
router.post(
  '/:id/enroll',
  authorize('student'),
  mongoIdValidation,
  validate,
  enrollStudent
);

export default router;

