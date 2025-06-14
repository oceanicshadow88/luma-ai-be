import { Router } from 'express';
import { registerRoutes } from '../../utils/registerRoutes';
// Controllers
import { adminRegister, teacherRegister } from '../../controllers/auth/registerController';
import { learnerRegister } from '../../controllers/auth/registerController';
import { loginEnterprise, loginLearner } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import { requestVerificationCode } from '../../controllers/auth/verifyCodeController';
import { companyController } from '../../controllers/companyController';
import { generateInvitation } from '../../controllers/invitationController';

// Middlewares
import { refreshToken } from '../../middleware/tokenHandler';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import { validateRegistration as adminRegistrationPreCheck } from '../../middleware/validation/adminRegistrationPreCheck';
import { validateRegistration as teacherRegistrationPreCheck } from '../../middleware/validation/teacherRegistrationPreCheck';

import {
  createFileUploader,
  ALLOWED_IMAGE_TYPES,
  wrapMulterMiddleware,
} from '../../middleware/fileUploader';

// Validation Schemas
import authValidationSchema from '../../validations/userAuthValidation';
import { companyValidationSchema } from '../../validations/companyValidation';
import { verifyAuthToken } from '../../controllers/auth/authController';
import { invitationSchema } from '../../validations/invitationValidation';
import { authGuard } from '../../middleware/authGuard';
import { quizzesController } from '../../controllers/dashboard/quizzesController';
import { roadmapsController } from '../../controllers/dashboard/roadmapsController';
import { adminDashboardController } from '../../controllers/dashboard/dashboardController';

const router = Router();

// ----------------- AUTH ROUTES -----------------
registerRoutes(router, [
  {
    method: 'post',
    path: '/auth/signup/admin',
    middlewares: [validateBody(authValidationSchema.register), adminRegistrationPreCheck],
    handler: adminRegister,
  },
  {
    method: 'post',
    path: '/auth/signup/teacher',
    middlewares: [validateBody(authValidationSchema.register), teacherRegistrationPreCheck],
    handler: teacherRegister,
  },
  {
    method: 'post',
    path: '/auth/register/learner',
    middlewares: [validateBody(authValidationSchema.learnerRegister)],
    handler: learnerRegister,
  },
  {
    method: 'post',
    path: '/auth/login/enterprise',
    middlewares: [validateBody(authValidationSchema.login)],
    handler: loginEnterprise,
  },
  {
    method: 'post',
    path: '/auth/login/learner',
    middlewares: [validateBody(authValidationSchema.login)],
    handler: loginLearner,
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
    path: '/auth/request-verification-code',
    handler: requestVerificationCode,
  },
  {
    method: 'post',
    path: '/auth/reset-password',
    handler: resetPassword,
  },
  {
    method: 'post',
    path: '/auth/token',
    handler: verifyAuthToken,
  },
]);

// ----------------- COMPANY ROUTES -----------------
const logoUploader = createFileUploader({
  folderName: 'company-logos',
  allowedMimeTypes: ALLOWED_IMAGE_TYPES.companyLogo,
  maxSizeMB: 5,
});

registerRoutes(router, [
  {
    method: 'post',
    path: '/auth/signup/institution',
    middlewares: [
      wrapMulterMiddleware(logoUploader.single('logo')),
      validateBody(companyValidationSchema),
    ],
    handler: companyController.createCompany,
  },
]);

// ----------------- INVITATION ROUTES -----------------
registerRoutes(router, [
  {
    method: 'post',
    path: '/invitation/generate',
    middlewares: [validateBody(invitationSchema)],
    handler: generateInvitation,
  },
]);

// ----------------- DASHBOARD ROUTES -----------------
registerRoutes(router, [
  {
    method: 'get',
    path: '/dashboard',
    middlewares: [authGuard],
    handler: adminDashboardController.getAdminDashboardData,
  },
  {
    method: 'get',
    path: '/dashboard/quizzes',
    middlewares: [authGuard],
    handler: quizzesController,
  },
  {
    method: 'get',
    path: '/dashboard/roadmaps',
    middlewares: [authGuard],
    handler: roadmapsController,
  },
]);

export default router;
