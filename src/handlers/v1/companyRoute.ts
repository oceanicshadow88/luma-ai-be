import { Router, RequestHandler } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { asyncHandler } from '../../middleware/asyncHandler';
import { companyController } from '../../controllers/companyController';
import { validateCompany } from '../../validations/companyValidaton';

const router = Router();

// Public routes
router.post(
  '/check-company-slug',
  validateCompany.checkCompanySlug as unknown as RequestHandler[],
  asyncHandler(companyController.checkCompanySlug),
);

router.post(
  '/create-company',
  validateCompany.createCompanyAndAccount as unknown as RequestHandler[],
  asyncHandler(companyController.createCompanyAndAccount),
);

// Protected routes
router.use(authGuard);

// Company management routes
router.get('/', asyncHandler(companyController.getCompanies));
router.get('/:id', asyncHandler(companyController.getCompanyById));
router.post(
  '/',
  validateCompany.createCompany as unknown as RequestHandler[],
  asyncHandler(companyController.createCompany),
);
router.patch(
  '/:id',
  validateCompany.updateCompany as unknown as RequestHandler[],
  asyncHandler(companyController.updateCompany),
);
router.delete('/:id', asyncHandler(companyController.deleteCompany));

// Invite management
router.post(
  '/:id/invites',
  validateCompany.createInvite as unknown as RequestHandler[],
  asyncHandler(companyController.createInvite),
);

export default router;
