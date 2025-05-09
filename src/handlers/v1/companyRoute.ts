import { Router, RequestHandler } from 'express';
import { companyController } from '../../controllers/companyController';
import { authGuard } from '../../middleware/authGuard';
import { validateCompany } from '../../validations/companyValidaton';

const router = Router();

// Create company
<<<<<<< HEAD
router.post(
  '/',
  authGuard as RequestHandler,
||||||| 99c1a32
router.post('/', 
  authMiddleware as RequestHandler,
=======
router.post(
  '/',
  authMiddleware as RequestHandler,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
  validateCompany.createCompany as unknown as RequestHandler[],
  companyController.createCompany as RequestHandler,
);

// Get all companies for current user
<<<<<<< HEAD
router.get('/', authGuard as RequestHandler, companyController.getCompanies as RequestHandler);
||||||| 99c1a32
router.get('/', 
  authMiddleware as RequestHandler,
  companyController.getCompanies as RequestHandler
);
=======
router.get('/', authMiddleware as RequestHandler, companyController.getCompanies as RequestHandler);
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3

// Get company by ID
<<<<<<< HEAD
router.get(
  '/:id',
  authGuard as RequestHandler,
||||||| 99c1a32
router.get('/:id', 
  authMiddleware as RequestHandler,
=======
router.get(
  '/:id',
  authMiddleware as RequestHandler,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
  validateCompany.getCompany as unknown as RequestHandler[],
  companyController.getCompanyById as RequestHandler,
);

// Update company
<<<<<<< HEAD
router.patch(
  '/:id',
  authGuard as RequestHandler,
||||||| 99c1a32
router.patch('/:id', 
  authMiddleware as RequestHandler,
=======
router.patch(
  '/:id',
  authMiddleware as RequestHandler,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
  validateCompany.updateCompany as unknown as RequestHandler[],
  companyController.updateCompany as RequestHandler,
);

// Delete company
<<<<<<< HEAD
router.delete(
  '/:id',
  authGuard as RequestHandler,
  companyController.deleteCompany as RequestHandler,
||||||| 99c1a32
router.delete('/:id',
  authMiddleware as RequestHandler,
  validateCompany.getCompany as unknown as RequestHandler[],
  companyController.deleteCompany as RequestHandler
=======
router.delete(
  '/:id',
  authMiddleware as RequestHandler,
  validateCompany.getCompany as unknown as RequestHandler[],
  companyController.deleteCompany as RequestHandler,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
);

// Check email and send verification code
router.post(
  '/verify-email',
  validateCompany.checkEmail as unknown as RequestHandler[],
  companyController.checkEmailAndSendCode as RequestHandler,
);

// Verify code
router.post(
  '/verify-code',
  validateCompany.verifyCode as unknown as RequestHandler[],
  companyController.verifyCode as RequestHandler,
);

// Resend verification code
<<<<<<< HEAD
router.post(
  '/resend-code',
  validateCompany.checkEmail as unknown as RequestHandler[],
  companyController.resendCode as RequestHandler,
||||||| 99c1a32
router.post('/resend-code',
  validateCompany.resendCode as unknown as RequestHandler[],
  companyController.resendCode as RequestHandler
=======
router.post(
  '/resend-code',
  validateCompany.resendCode as unknown as RequestHandler[],
  companyController.resendCode as RequestHandler,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
);

// Check domain and create organization if needed
<<<<<<< HEAD
router.post(
  '/check-domain',
  validateCompany.completeRegistration as unknown as RequestHandler[],
  companyController.checkDomainAndCreate as RequestHandler,
||||||| 99c1a32
router.post('/check-domain',
  validateCompany.checkDomain as unknown as RequestHandler[],
  companyController.checkDomainAndCreate as RequestHandler
=======
router.post(
  '/check-domain',
  validateCompany.checkDomain as unknown as RequestHandler[],
  companyController.checkDomainAndCreate as RequestHandler,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
);

// Complete registration
router.post(
  '/complete-registration',
  validateCompany.completeRegistration as unknown as RequestHandler[],
  companyController.completeRegistration as RequestHandler,
);

export default router;
