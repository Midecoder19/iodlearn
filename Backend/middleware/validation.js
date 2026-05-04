const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Name must be between 2 and 30 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  validate
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('Name must be between 2 and 30 characters'),
  body('username')
    .optional()
    .trim()
    .matches(/^[a-z0-9_]{3,20}$/).withMessage('Username must be 3-20 lowercase alphanumeric characters'),
  validate
];

const validateCourse = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('lessons')
    .optional()
    .isArray().withMessage('Lessons must be an array')
    .custom((lessons) => {
      if (lessons.length > 5000) {
        throw new Error('Maximum 5000 lessons allowed per course');
      }
      if (!Array.isArray(lessons)) {
        throw new Error('Lessons must be an array');
      }
      return true;
    }),
  validate
];

const validateLesson = [
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('videoUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Video URL must be a valid HTTPS URL')
    .isLength({ max: 2000 }).withMessage('Video URL cannot exceed 2000 characters'),
  body('pdfUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('PDF URL must be a valid HTTPS URL')
    .isLength({ max: 2000 }).withMessage('PDF URL cannot exceed 2000 characters'),
  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a positive number (in minutes)'),
  validate
];

const validateMentorApplication = [
  body('bio')
    .trim()
    .notEmpty().withMessage('Bio is required')
    .isLength({ min: 50, max: 500 }).withMessage('Bio must be between 50 and 500 characters'),
  body('expertise')
    .isArray({ min: 1 }).withMessage('At least one expertise is required'),
  body('experience')
    .trim()
    .notEmpty().withMessage('Experience is required'),
  validate
];

const validateReview = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate
];

const validatePayment = [
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID'),
  validate
];

const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  validate
];

const validateResetPassword = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  validate
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCourse,
  validateLesson,
  validateMentorApplication,
  validateReview,
  validatePayment,
  validateMongoId,
  validatePagination,
  validateForgotPassword,
  validateResetPassword
};