import { Router } from 'express';

import { verifyAuthToken } from '../../controllers/auth/authController';
import { loginEnterprise, loginLearner } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import {
  adminRegister,
  learnerRegister,
  teacherRegister,
} from '../../controllers/auth/registerController';
import { requestVerificationCode } from '../../controllers/auth/verifyCodeController';
import { companyController } from '../../controllers/companyController';
import { dashboardController } from '../../controllers/dashboardController';
import { generateInvitation } from '../../controllers/invitationController';
import { authGuard } from '../../middleware/authGuard';
import { extractFrontendUrl } from '../../middleware/extractFrontendUrl';
import {
  ALLOWED_IMAGE_TYPES,
  createFileUploader,
  wrapMulterMiddleware,
} from '../../middleware/fileUploader';
import { saas } from '../../middleware/saasMiddleware';
import { refreshToken } from '../../middleware/tokenHandler';
import { adminRegistrationPreCheck } from '../../middleware/validation/adminRegistrationPreCheck';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import { registerRoutes } from '../../utils/registerRoutes';
import { companyValidationSchema } from '../../validations/companyValidation';
import { invitationSchema } from '../../validations/invitationValidation';
import authValidationSchema from '../../validations/userAuthValidation';

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
    path: '/auth/signup/instructor',
    middlewares: [saas, validateBody(authValidationSchema.register)],
    handler: teacherRegister,
  },
  {
    method: 'post',
    path: '/auth/signup/learner',
    middlewares: [saas, validateBody(authValidationSchema.learnerRegister)],
    handler: learnerRegister,
  },
  {
    method: 'post',
    path: '/auth/login/enterprise',
    middlewares: [saas, validateBody(authValidationSchema.login)],
    handler: loginEnterprise,
  },
  {
    method: 'post',
    path: '/auth/login/learner',
    middlewares: [saas, validateBody(authValidationSchema.login)],
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
    middlewares: [extractFrontendUrl, saas, validateBody(invitationSchema)],
    handler: generateInvitation,
  },
]);

// ----------------- DASHBOARD ROUTES -----------------
registerRoutes(router, [
  {
    method: 'get',
    path: '/dashboard',
    middlewares: [saas, authGuard],
    handler: dashboardController.getAdminDashboard,
  },
]);

export default router;
