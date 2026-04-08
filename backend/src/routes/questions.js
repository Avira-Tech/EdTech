import express from 'express';
import { body, param } from 'express-validator';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  createBulkQuestions,
  updateQuestion,
  deleteQuestion,
  deleteBulkQuestions,
  getQuestionStats,
  getCategories
} from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeHierarchy } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get question categories/tags
router.get('/categories', getCategories);

// Get question statistics
router.get('/stats', authorize('superadmin', 'admin', 'teacher'), getQuestionStats);

// Get all questions
router.get('/', getQuestions);

// Get question by ID
router.get('/:id', mongoIdValidation, validate, getQuestionById);

// Create question (Admin/Teacher)
router.post(
  '/',
  authorizeHierarchy('teacher'),
  [
    body('question').trim().notEmpty().withMessage('Question text is required'),
    body('type').isIn(['multiple-choice', 'true-false', 'short-answer', 'essay', 'fill-blank', 'matching']).withMessage('Invalid question type'),
    body('course').isMongoId().withMessage('Valid course ID is required')
  ],
  validate,
  createQuestion
);

// Create bulk questions (Admin/Teacher)
router.post(
  '/bulk',
  authorizeHierarchy('teacher'),
  [
    body('questions').isArray({ min: 1 }).withMessage('Questions array is required')
  ],
  validate,
  createBulkQuestions
);

// Update question (Admin/Teacher - owner only)
router.put(
  '/:id',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  updateQuestion
);

// Delete question (Admin/Teacher - owner only)
router.delete(
  '/:id',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  deleteQuestion
);

// Delete multiple questions (Admin/Teacher)
router.post(
  '/delete-bulk',
  authorizeHierarchy('teacher'),
  [
    body('questionIds').isArray({ min: 1 }).withMessage('Question IDs array is required')
  ],
  validate,
  deleteBulkQuestions
);

export default router;

