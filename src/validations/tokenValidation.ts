import { body, ValidationChain } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

export const validateToken = {
  getValidToken: [
    body('token')
      .notEmpty()
      .withMessage('Token is required'),
    body('type')
      .isIn(['refresh', 'access'])
      .withMessage('Invalid token type'),
    validateRequest
  ],

  invalidateToken: [
    body('token')
      .notEmpty()
      .withMessage('Token is required'),
    validateRequest
  ]
}; 