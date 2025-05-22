import { Router, RequestHandler } from 'express';
import { companyController } from '../../controllers/companyController';
import { registerRoutes } from '../../utils/registerRoutes';
import { createCompanySchema } from '../../validations/companyValidaton';

const router = Router();

// Public routes
registerRoutes(router, [
  {
    // regist company
    method: 'post',
    path: '/signup/institution',
    middlewares: [createCompanySchema] as unknown as RequestHandler[],
    handler: companyController.createCompany,
  },
]);

export default router;
