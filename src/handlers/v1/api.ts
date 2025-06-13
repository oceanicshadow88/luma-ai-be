import { loginEnterprise, loginLearner } from '@src/controllers/auth/loginController';
import { userLogout } from '@src/controllers/auth/logoutController';
import { resetPassword } from '@src/controllers/auth/passwordResetController';
import { adminRegister } from '@src/controllers/auth/registerController';
import { learnerRegister } from '@src/controllers/auth/registerController';
import { requestVerificationCode } from '@src/controllers/auth/verifyCodeController';
import { companyController } from '@src/controllers/companyController';
import { adminDashboardController } from '@src/controllers/dashboard/dashboardController';
import { quizzesController } from '@src/controllers/dashboard/quizzesController';
import { roadmapsController } from '@src/controllers/dashboard/roadmapsController';
import { generateInvitation } from '@src/controllers/invitationController';
import { authGuard } from '@src/middleware/authGuard';
import {
  ALLOWED_IMAGE_TYPES,
  createFileUploader,
  wrapMulterMiddleware,
} from '@src/middleware/fileUploader';
import { refreshToken } from '@src/middleware/tokenHandler';
import { validateRegistration as adminRegistrationPreCheck } from '@src/middleware/validation/adminRegistrationPreCheck';
import { validateBody } from '@src/middleware/validation/validationMiddleware';
import { registerRoutes } from '@src/utils/registerRoutes';
import { companyValidationSchema } from '@src/validations/companyValidation';
import { invitationSchema } from '@src/validations/invitationValidation';
import authValidationSchema from '@src/validations/userAuthValidation';
import { Router } from 'express';

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
    path: '/auth/signup/learner',
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
