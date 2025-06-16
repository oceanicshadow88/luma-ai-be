import { Router } from 'express';
import { registerRoutes } from '../../utils/registerRoutes';
import { adminRegister, learnerRegister } from '../../controllers/auth/registerController';
import { loginEnterprise, loginLearner } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { resetPassword } from '../../controllers/auth/passwordResetController';
import { requestVerificationCode } from '../../controllers/auth/verifyCodeController';
import { companyController } from '../../controllers/companyController';
import { generateInvitation } from '../../controllers/invitationController';
import { refreshToken } from '../../middleware/tokenHandler';
import { validateBody } from '../../middleware/validation/validationMiddleware';
import { adminRegistrationPreCheck } from '../../middleware/validation/adminRegistrationPreCheck';
import {
  createFileUploader,
  ALLOWED_IMAGE_TYPES,
  wrapMulterMiddleware,
} from '../../middleware/fileUploader';
import authValidationSchema from '../../validations/userAuthValidation';
import { companyValidationSchema } from '../../validations/companyValidation';
import { verifyAuthToken } from '../../controllers/auth/authController';
import { invitationSchema } from '../../validations/invitationValidation';

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
    path: '/auth/signup/learner',
    middlewares: [validateBody(authValidationSchema.learnerRegister)],
    handler: learnerRegister,
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
    path: '/auth/request-reset-code',
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
    path: '/company/register',
    middlewares: [
      wrapMulterMiddleware(logoUploader.single('logo')),
      validateBody(companyValidationSchema),
    ],
    handler: companyController.createCompany,
  },
  {
    method: 'post',
    path: '/auth/login/enterprise',
    middlewares: [validateBody(authValidationSchema.login)],
    handler: loginEnterprise,
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

export default router;
