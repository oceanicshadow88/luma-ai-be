import { Router } from 'express';
import { adminRegister } from '../../controllers/auth/registerController';
import { adminLogin } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { refreshToken } from '../../middleware/tokenHandler';
import { requestResetCode, resetPassword, verifyResetCode } from '../../controllers/codeController';
import { registerRoutes } from '../../utils/registerRoutes';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import authValidationSchema from '../../validations/userAuthValidation';

const router = Router();

// Registration flow
registerRoutes(router, [
  {
    // Admin registration
    method: 'post',
    path: '/register/admin',
    middlewares: [
      // validateRegistration,
      validateBody(authValidationSchema.register),
    ],
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
