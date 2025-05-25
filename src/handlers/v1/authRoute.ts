import { Router } from 'express';
import { adminRegister } from '../../controllers/auth/registerController';
import { adminLogin } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { refreshToken } from '../../middleware/tokenHandler';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import { requestVerificationCode } from '../../controllers/auth/verifyCodeController';
import { registerRoutes } from '../../utils/registerRoutes';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import authValidationSchema from '../../validations/userAuthValidation';
import { validateRegistration as adminRegistrationPreCheck } from '../../middleware/validation/adminRegistrationPreCheck';

const router = Router();

// Registration flow
registerRoutes(router, [
  {
    // Admin registration
    method: 'post',
    path: '/register/admin',
    middlewares: [validateBody(authValidationSchema.register), adminRegistrationPreCheck],
    handler: adminRegister,
  },
  {
    // Login
    method: 'post',
    path: '/login',
    middlewares: [validateBody(authValidationSchema.login)],
    handler: adminLogin,
  },
  {
    // Logout
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
    handler: requestVerificationCode,
  },
  {
    method: 'post',
    path: '/reset-password',
    handler: resetPassword,
  },
]);

export default router;
