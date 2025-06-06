import { Router } from 'express';
import { registerRoutes } from '../../utils/registerRoutes';

// Controllers
import { adminRegister } from '../../controllers/auth/registerController';
import { studentRegister } from '../../controllers/auth/registerController';
import { login } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import { requestVerificationCode } from '../../controllers/auth/verifyCodeController';
import { companyController } from '../../controllers/companyController';

// Middlewares
import { refreshToken } from '../../middleware/tokenHandler';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import { validateRegistration as adminRegistrationPreCheck } from '../../middleware/validation/adminRegistrationPreCheck';
import { validateStudentRegistration as studentRegistrationPreCheck } from '../../middleware/validation/studentRegistrationPreCheck';

// Validation Schemas
import authValidationSchema from '../../validations/userAuthValidation';
import { companyValidationSchema } from '../../validations/companyValidation';

const router = Router();

// ----------------- AUTH ROUTES -----------------
registerRoutes(router, [
  {
    method: 'post',
    path: '/auth/register/admin',
    middlewares: [validateBody(authValidationSchema.register), adminRegistrationPreCheck],
    handler: adminRegister,
  },
  {
    method: 'post',
    path: '/auth/register/student/:organizationId',
    middlewares: [validateBody(authValidationSchema.studentRegister), studentRegistrationPreCheck],
    handler: studentRegister,
  },
  {
    method: 'post',
    path: '/auth/login',
    middlewares: [validateBody(authValidationSchema.login)],
    handler: login,
  },
  {
    method: 'post',
    path: '/auth/logout',
    handler: userLogout,
  },
  {
    method: 'post',
    path: '/auth/refresh-token',
    handler: refreshToken,
  },
  {
    method: 'post',
    path: '/auth/request-reset-code',
    handler: requestVerificationCode,
  },
  {
    method: 'post',
    path: '/auth/reset-password',
    handler: resetPassword,
  },
]);

// ----------------- COMPANY ROUTES -----------------
registerRoutes(router, [
  {
    method: 'post',
    path: '/company/register',
    middlewares: [validateBody(companyValidationSchema)],
    handler: companyController.createCompany,
  },
]);

export default router;
