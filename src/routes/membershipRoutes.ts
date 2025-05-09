import { Router } from 'express';
import { validateMembership } from '../validations/membershipValidation';
import { membershipController } from '../controllers/membershipController';

const router = Router();

router.post('/', 
  validateMembership.createMembership,
  membershipController.createMembership
);

export default router; 