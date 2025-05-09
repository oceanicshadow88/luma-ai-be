import { body, param, ValidationChain } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

export const validateMembership = {
  createMembership: [
    body('companyId').isMongoId().withMessage('Invalid company ID'),
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('role').isIn(['admin', 'instructor', 'student']).withMessage('Invalid role'),
    body('status').optional().isIn(['invited', 'active', 'disabled']).withMessage('Invalid status'),
    validateRequest,
  ],

  getMembershipsByCompany: [
    param('companyId').isMongoId().withMessage('Invalid company ID'),
    validateRequest,
  ],

  getMembershipsByUser: [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    validateRequest,
  ],

  updateMembership: [
    param('id').isMongoId().withMessage('Invalid membership ID'),
    body('role').optional().isIn(['admin', 'instructor', 'student']).withMessage('Invalid role'),
    body('status').optional().isIn(['invited', 'active', 'disabled']).withMessage('Invalid status'),
    validateRequest,
  ],

  deleteMembership: [param('id').isMongoId().withMessage('Invalid membership ID'), validateRequest],
};
