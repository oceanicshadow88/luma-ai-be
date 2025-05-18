import { Router, RequestHandler } from 'express';
import { companyController } from '../../controllers/companyController';
import { authGuard } from '../../middleware/authGuard';
import { validateCompany } from '../../validations/companyValidaton';

const router = Router();

// Auth related routes
router.post(
  ' ',
  validateCompany.checkEmail as unknown as RequestHandler[],
  companyController.checkEmailAndSendCode as RequestHandler,
);

router.post(
  '/auth/login',
  validateCompany.verifyCode as unknown as RequestHandler[],
  companyController.verifyCode as RequestHandler,
);

// Protected company routes
router.post(
  '/',
  authGuard as RequestHandler,
  validateCompany.createCompany as unknown as RequestHandler[],
  companyController.createCompany as RequestHandler,
);

router.get(
  '/:id',
  authGuard as RequestHandler,
  validateCompany.getCompany as unknown as RequestHandler[],
  companyController.getCompanyById as RequestHandler,
);

// Invite management
router.post(
  '/:id/invites',
  authGuard as RequestHandler,
  validateCompany.createInvite as unknown as RequestHandler[],
  companyController.createInvite as RequestHandler,
);

// Get all companies for current user
router.get('/', authGuard as RequestHandler, companyController.getCompanies as RequestHandler);

// Update company
router.patch(
  '/:id',
  authGuard as RequestHandler,
  validateCompany.updateCompany as unknown as RequestHandler[],
  companyController.updateCompany as RequestHandler,
);

// Delete company
router.delete(
  '/:id',
  authGuard as RequestHandler,
  companyController.deleteCompany as RequestHandler,
);

// Resend verification code
router.post(
  '/resend-code',
  validateCompany.checkEmail as unknown as RequestHandler[],
  companyController.resendCode as RequestHandler,
);

// Check domain and create organization if needed
router.post(
  '/check-domain',
  validateCompany.completeRegistration as unknown as RequestHandler[],
  companyController.checkDomainAndCreate as RequestHandler,
);

// Complete registration
router.post(
  '/complete-registration',
  validateCompany.completeRegistration as unknown as RequestHandler[],
  companyController.completeRegistration as RequestHandler,
);

export default router;
