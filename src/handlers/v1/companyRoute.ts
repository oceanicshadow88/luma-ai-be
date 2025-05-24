import { Router, RequestHandler } from 'express';
import { companyController } from '../../controllers/companyController';
import { registerRoutes } from '../../utils/registerRoutes';
import { companyValidationSchema } from '../../validations/companyValidaton';
import { validateBody } from '../../middleware/validation/validationMiddleware';

const router = Router();

registerRoutes(router, [
  {
    // regist company
    method: 'post',
    path: '/register',
    middlewares: [validateBody(companyValidationSchema)] as unknown as RequestHandler[],
    handler: companyController.createCompany,
  },
]);

export default router;
