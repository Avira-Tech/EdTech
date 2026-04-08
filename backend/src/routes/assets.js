import express from 'express';
import { body, param } from 'express-validator';
import {
  getAssets,
  getAssetById,
  uploadAsset,
  updateAsset,
  deleteAsset,
  getFolders,
  trackDownload
} from '../controllers/assetController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate, mongoIdValidation } from '../middleware/validate.js';
import upload from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all assets
router.get('/', authorize('superadmin', 'admin', 'teacher'), getAssets);

// Get asset folders
router.get('/folders', getFolders);

// Get asset by ID
router.get('/:id', mongoIdValidation, validate, getAssetById);

// Upload new asset
router.post(
  '/',
  authorize('superadmin', 'admin', 'teacher'),
  upload.single('file'),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('folder').optional().trim(),
    body('tags').optional()
  ],
  validate,
  uploadAsset
);

// Track download
router.post(
  '/:id/download',
  mongoIdValidation,
  validate,
  trackDownload
);

// Update asset
router.put(
  '/:id',
  authorize('superadmin', 'admin', 'teacher'),
  mongoIdValidation,
  validate,
  updateAsset
);

// Delete asset
router.delete(
  '/:id',
  authorize('superadmin', 'admin', 'teacher'),
  mongoIdValidation,
  validate,
  deleteAsset
);

export default router;

