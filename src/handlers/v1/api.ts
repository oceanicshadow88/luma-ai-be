import { handleLogin } from '@src/controllers/auth/loginController';
import { validateTokenAndUrlWithInvitedUser } from '@src/middleware/someAuth';
import { Router } from 'express';

import { isActiveUser, verifyAuthToken, verifyDomain } from '../../controllers/auth/authController';
import { userLogout } from '../../controllers/auth/logoutController';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import {
  adminRegister,
  checkCompanyAvailability,
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
    middlewares: [
      saas,
      validateTokenAndUrlWithInvitedUser,
      validateBody(authValidationSchema.register),
    ],
    handler: adminRegister,
  },
  {
    method: 'post',
    path: '/auth/signup/instructor',
    middlewares: [
      saas,
      validateTokenAndUrlWithInvitedUser,
      validateBody(authValidationSchema.register),
    ],
    handler: teacherRegister,
  },
  {
    method: 'post',
    path: '/auth/signup/learner',
    middlewares: [
      saas,
      validateTokenAndUrlWithInvitedUser,
      validateBody(authValidationSchema.learnerRegister),
    ],
    handler: learnerRegister,
  },
  {
    method: 'post',
    path: '/auth/login',
    middlewares: [saas, validateBody(authValidationSchema.login)],
    handler: handleLogin,
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
    middlewares: [saas, validateBody(authValidationSchema.resetPassword)],
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
  {
    method: 'get',
    path: '/auth/verify-user',
    middlewares: [saas],
    handler: isActiveUser,
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
      authGuard,
    ],
    handler: handleOwnerRegistrationProcess,
  },
  {
    method: 'get',
    path: '/auth/institution/:companySlug',
    handler: checkCompanyAvailability,
  },
]);

// ----------------- INVITATION ROUTES -----------------
registerRoutes(router, [
  //TODO: Secure this route
  {
    method: 'post',
    path: '/invitation/generate',
    middlewares: [extractFrontendUrl, saas, validateBody(invitationSchema)],
    handler: generateInvitation,
  },
]);

// -------------- DASHBOARD ROUTES -----------------
registerRoutes(router, [
  {
    method: 'get',
    path: '/dashboard',
    middlewares: [saas, authGuard],
    handler: dashboardController.getAdminDashboard,
  },
]);

export default router;
