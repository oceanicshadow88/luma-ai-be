import { body, param, ValidationChain } from 'express-validator';
import { validateRequest } from '../middleware/validation/validateRequest';

// Separate validation rules and middleware
const createCompanyValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('plan')
    .trim()
    .notEmpty()
    .withMessage('Plan is required')
    .isIn(['free', 'pro', 'enterprise'])
    .withMessage('Invalid plan type'),
  body('settings.timezone').optional().isString().withMessage('Timezone must be a string'),
  body('settings.locale').optional().isString().withMessage('Locale must be a string'),
  body('settings.logoUrl').optional().isURL().withMessage('Logo URL must be a valid URL'),
  body('settings.primaryColor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
];

const updateCompanyValidation: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid company ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('plan')
    .optional()
    .trim()
    .isIn(['free', 'pro', 'enterprise'])
    .withMessage('Invalid plan type'),
  body('settings.timezone').optional().isString().withMessage('Timezone must be a string'),
  body('settings.locale').optional().isString().withMessage('Locale must be a string'),
  body('settings.logoUrl').optional().isURL().withMessage('Logo URL must be a valid URL'),
  body('settings.primaryColor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Primary color must be a valid hex color'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
];

const getCompanyValidation: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid company ID'),
];

// Export middleware arrays
export const validateCompany = {
  createCompany: [...createCompanyValidation, validateRequest],
  updateCompany: [...updateCompanyValidation, validateRequest],
  getCompany: [...getCompanyValidation, validateRequest],
  checkEmail: [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage('Invalid email domain'),
    validateRequest,
  ],
  verifyCode: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('code').isLength({ min: 4, max: 4 }).isNumeric().withMessage('Invalid verification code'),
    validateRequest,
  ],
  completeRegistration: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').isIn(['admin', 'instructor']).withMessage('Invalid role'),
    body('companyId').isMongoId().withMessage('Invalid company ID'),
    validateRequest,
  ],
  createInvite: [
    param('id').isMongoId().withMessage('Invalid company ID'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('role').isIn(['admin', 'instructor']).withMessage('Invalid role'),
    validateRequest,
  ],
  acceptInvite: [param('token').isString().withMessage('Invalid invite token'), validateRequest],
  checkCompanySlug: [
    body('companyName')
      .trim()
      .notEmpty()
      .withMessage('Company name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    validateRequest,
  ],
  createCompanyAndAccount: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    validateRequest,
  ],
};
