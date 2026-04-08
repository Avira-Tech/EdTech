import express from 'express';
import { body, param } from 'express-validator';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  submitAssignment,
  gradeSubmission,
  getMySubmissions
} from '../controllers/assignmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeHierarchy } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all assignments
router.get('/', getAssignments);

// Get my submissions (Student)
router.get('/my-submissions', authenticate, getMySubmissions);

// Get assignment by ID
router.get('/:id', mongoIdValidation, validate, getAssignmentById);

// Create assignment (Admin/Teacher)
router.post(
  '/',
  authorizeHierarchy('teacher'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('course').isMongoId().withMessage('Valid course ID is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('points').isInt({ min: 1 }).withMessage('Points must be at least 1')
  ],
  validate,
  createAssignment
);

// Update assignment (Admin/Teacher - owner only)
router.put(
  '/:id',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  updateAssignment
);

// Delete assignment (Admin/Teacher - owner only)
router.delete(
  '/:id',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  deleteAssignment
);

// Get submissions for an assignment (Admin/Teacher)
router.get(
  '/:id/submissions',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  getSubmissions
);

// Submit assignment (Student)
router.post(
  '/:id/submit',
  authorize('student'),
  mongoIdValidation,
  validate,
  submitAssignment
);

// Grade submission (Admin/Teacher)
router.put(
  '/:id/submissions/:submissionId/grade',
  authorizeHierarchy('teacher'),
  [
    param('id').isMongoId(),
    param('submissionId').isMongoId(),
    body('score').isNumeric().withMessage('Score is required'),
    body('feedback').optional().trim()
  ],
  validate,
  gradeSubmission
);

export default router;

