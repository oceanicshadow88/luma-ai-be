import { Router, RequestHandler } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { companyController } from '../../controllers/companyController';
import { validateCompany } from '../../validations/companyValidaton';
import { registerRoutes } from '../../utils/registerRoutes';

const router = Router();

// Public routes
registerRoutes(router, [
  {
    method: 'post',
    path: '/check-company-slug',
    middlewares: [validateCompany.checkCompanySlug] as unknown as RequestHandler[],
    handler: companyController.checkCompanySlug,
  },
  {
    method: 'post',
    path: '/create-company',
    middlewares: [validateCompany.createCompanyAndAccount] as unknown as RequestHandler[],
    handler: companyController.createCompanyAndAccount,
  },
]);

// Protected routes
router.use(authGuard);

// Company management routes
registerRoutes(router, [
  {
    method: 'get',
    path: '/',
    handler: companyController.getCompanies,
  },
  {
    method: 'get',
    path: '/:id',
    handler: companyController.getCompanyById,
  },
  {
    method: 'post',
    path: '/',
    middlewares: [validateCompany.createCompany] as unknown as RequestHandler[],
    handler: companyController.createCompany,
  },
  {
    method: 'patch',
    path: '/:id',
    middlewares: [validateCompany.updateCompany] as unknown as RequestHandler[],
    handler: companyController.updateCompany,
  },
  {
    method: 'delete',
    path: '/:id',
    handler: companyController.deleteCompany,
  },
  {
    method: 'post',
    path: '/:id/invites',
    middlewares: [validateCompany.createInvite] as unknown as RequestHandler[],
    handler: companyController.createInvite,
  },
]);

export default router;
