import express from 'express';
import { body, param } from 'express-validator';
import {
  getLibraryItems,
  getLibraryItemById,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
  rateLibraryItem,
  trackDownload,
  getCategories
} from '../controllers/libraryController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeHierarchy } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get categories
router.get('/categories', getCategories);

// Get all library items
router.get('/', getLibraryItems);

// Get library item by ID
router.get('/:id', mongoIdValidation, validate, getLibraryItemById);

// Create library item
router.post(
  '/',
  authorizeHierarchy('teacher'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').isIn(['book', 'article', 'video', 'podcast', 'tutorial', 'template', 'cheatsheet', 'other']).withMessage('Invalid type'),
    body('category').trim().notEmpty().withMessage('Category is required')
  ],
  validate,
  createLibraryItem
);

// Update library item
router.put(
  '/:id',
  authorizeHierarchy('teacher'),
  mongoIdValidation,
  validate,
  updateLibraryItem
);

// Delete library item
router.delete(
  '/:id',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  validate,
  deleteLibraryItem
);

// Rate library item
router.post(
  '/:id/rate',
  authenticate,
  mongoIdValidation,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validate,
  rateLibraryItem
);

// Track download
router.post(
  '/:id/download',
  authenticate,
  mongoIdValidation,
  validate,
  trackDownload
);

export default router;

