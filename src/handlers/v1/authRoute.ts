import { Router, RequestHandler } from 'express';
import { validateRegistration } from '../../middleware/validation/validateRegistration';
import { asyncHandler } from '../../middleware/asyncHandler';
import { companyController } from '../../controllers/companyController';
import { adminRegister } from '../../controllers/auth/registerController';
import { adminLogin } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { refreshToken } from '../../controllers/auth/tokenController';
import { requestResetCode, resetPassword, verifyResetCode } from '../../controllers/codeController';
import { validateCompany } from '../../validations/companyValidaton';

const router = Router();

// Registration flow
router.post(
  '/check-email',
  validateCompany.checkEmail as unknown as RequestHandler[],
  asyncHandler(companyController.checkEmailAndSendCode),
);

// Admin registration
router.post('/register/admin', validateRegistration, asyncHandler(adminRegister));

// Other auth routes...
router.post('/login', asyncHandler(adminLogin));
router.post('/logout', asyncHandler(userLogout));
router.post('/refresh-token', asyncHandler(refreshToken));

router.post('/request-reset-code', asyncHandler(requestResetCode));
router.post('/verify-reset-code', asyncHandler(verifyResetCode));
router.post('/reset-password', asyncHandler(resetPassword));

export default router;
