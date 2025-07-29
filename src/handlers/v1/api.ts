import { adminRegistrationPreCheck } from '@src/middleware/validation/adminRegistrationPreCheck';
import { Router } from 'express';

import { verifyAuthToken, verifyDomain } from '../../controllers/auth/authController';
import { loginEnterprise, loginLearner } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import {
  adminRegister,
  handleOwnerRegistrationProcess,
  learnerRegister,
  teacherRegister,
} from '../../controllers/auth/registerController';
import { requestVerificationCode } from '../../controllers/auth/verifyCodeController';
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
    middlewares: [validateBody(authValidationSchema.verificationCode)],
    handler: requestVerificationCode,
  },
  {
    method: 'post',
    path: '/auth/reset-password',
    middlewares: [validateBody(authValidationSchema.resetPassword)],
    handler: resetPassword,
  },
  {
    method: 'post',
    path: '/auth/token',
    handler: verifyAuthToken,
  },
  {
    method: 'get',
    path: '/auth/verify-domain',
    handler: verifyDomain,
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
    path: '/auth/signup/institution', //TODO: Change to /owner/register
    middlewares: [
      wrapMulterMiddleware(logoUploader.single('logo')),
      validateBody(companyValidationSchema),
    ],
    handler: handleOwnerRegistrationProcess,
  },
]);

// ----------------- INVITATION ROUTES -----------------
registerRoutes(router, [ //TODO: Secure this route
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
