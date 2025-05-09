import { Router, RequestHandler } from 'express';
import { validateMembership } from '../../validations/membershipValidation';
import { membershipController } from '../../controllers/membershipController';

const router = Router();

router.post('/', 
  validateMembership.createMembership as unknown as RequestHandler[],
  membershipController.createMembership as RequestHandler
);

router.get('/company/:companyId',
  validateMembership.getMembershipsByCompany as unknown as RequestHandler[],
  membershipController.getMembershipsByCompany as RequestHandler
);

export default router; 