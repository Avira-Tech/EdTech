import { validationResult, body, param, query } from 'express-validator';

// Handle validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
export const userValidation = {
  register: [
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role')
      .optional()
      .isIn(['student', 'teacher']).withMessage('Invalid role')
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  update: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\- ]+$/).withMessage('Invalid phone number'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
  ]
};

// Course validation rules
export const courseValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Course title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Course description is required')
      .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
    body('category')
      .trim()
      .notEmpty().withMessage('Category is required'),
    body('pricing.type')
      .optional()
      .isIn(['free', 'one-time', 'subscription']).withMessage('Invalid pricing type'),
    body('pricing.price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level')
  ],
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
  ]
};

// Assignment validation rules
export const assignmentValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Assignment title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Assignment description is required'),
    body('course')
      .notEmpty().withMessage('Course ID is required')
      .isMongoId().withMessage('Invalid course ID'),
    body('dueDate')
      .notEmpty().withMessage('Due date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('points')
      .notEmpty().withMessage('Points are required')
      .isInt({ min: 1 }).withMessage('Points must be at least 1')
  ]
};

// Question validation rules
export const questionValidation = {
  create: [
    body('question')
      .trim()
      .notEmpty().withMessage('Question text is required')
      .isLength({ max: 2000 }).withMessage('Question cannot exceed 2000 characters'),
    body('type')
      .notEmpty().withMessage('Question type is required')
      .isIn(['multiple-choice', 'true-false', 'short-answer', 'essay', 'fill-blank', 'matching'])
      .withMessage('Invalid question type'),
    body('course')
      .notEmpty().withMessage('Course ID is required')
      .isMongoId().withMessage('Invalid course ID'),
    body('points')
      .optional()
      .isInt({ min: 1 }).withMessage('Points must be at least 1')
  ]
};

// Common validation helpers
export const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

