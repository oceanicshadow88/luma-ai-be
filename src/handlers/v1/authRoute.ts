import { Router, RequestHandler } from 'express';
import { validateRegistration } from '../../middleware/validation/validateRegistration';
import { companyController } from '../../controllers/companyController';
import { adminRegister } from '../../controllers/auth/registerController';
import { adminLogin } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { refreshToken } from '../../controllers/auth/tokenController';
import { requestResetCode, resetPassword, verifyResetCode } from '../../controllers/codeController';
import { validateCompany } from '../../validations/companyValidaton';
import { registerRoutes } from '../../utils/registerRoutes';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import authValidationSchema from '../../validations/userAuthValidation';

const router = Router();

// Registration flow
registerRoutes(router, [
  {
    method: 'post',
    path: '/check-email',
    middlewares: validateCompany.checkEmail as unknown as RequestHandler[],
    handler: companyController.checkEmailAndSendCode,
  },
  {// Admin registration
    method: 'post',
    path: '/register/admin',
    middlewares: [
      validateRegistration,
      validateBody(authValidationSchema.register)],
    handler: adminRegister,
  },
  { // Login
    method: 'post',
    path: '/login',
    middlewares: [validateBody(authValidationSchema.login)],
    handler: adminLogin,
  },
  { // Logout
    method: 'post',
    path: '/logout',
    handler: userLogout,
  },
  // token
  {
    method: 'post',
    path: '/refresh-token',
    handler: refreshToken,
  },
  {
    method: 'post',
    path: '/request-reset-code',
    handler: requestResetCode,
  },
  {
    method: 'post',
    path: '/verify-reset-code',
    handler: verifyResetCode,
  },
  {
    method: 'post',
    path: '/reset-password',
    handler: resetPassword,
  },
]);

export default router;
