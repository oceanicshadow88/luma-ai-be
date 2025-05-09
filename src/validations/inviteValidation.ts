import { body, param, ValidationChain } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

export const validateInvite = {
  createInvite: [
    body('companyId')
      .isMongoId()
      .withMessage('Invalid company ID'),
    body('email')
      .isEmail()
      .withMessage('Invalid email format'),
    body('role')
      .isIn(['admin', 'instructor', 'student'])
      .withMessage('Invalid role'),
    validateRequest
  ],

  acceptInvite: [
    param('token')
      .notEmpty()
      .withMessage('Token is required')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid token format'),
    validateRequest
  ],

  getActiveInvites: [
    param('companyId')
      .isMongoId()
      .withMessage('Invalid company ID'),
    validateRequest
  ]
}; 