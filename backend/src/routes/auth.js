import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  refreshToken,
  getProfile,
  logout
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', body('refreshToken').notEmpty().withMessage('Refresh token is required'), validate, refreshToken);
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;

