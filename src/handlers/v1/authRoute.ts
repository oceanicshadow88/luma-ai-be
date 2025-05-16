import { Request, Response, NextFunction, Router } from 'express';
import * as authController from '../../controllers/auth/registerController';
import { validateBody } from '../../middleware/validationMiddleware';
import authValidationSchema from '../../validations/userAuthValidation';
import { adminLogin } from '../../controllers/auth/loginController';
import { userLogout } from '../../controllers/auth/logoutController';
import { refreshToken } from '../../services/auth/tokenController';
import { requestResetCode, resetPassword, verifyResetCode } from '../../controllers/codeController';
const router = Router();

// Helper function to handle async routes
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

router.post(
  '/register/admin',
  validateBody(authValidationSchema.register),
  asyncHandler(authController.register),
);

router.post('/login', validateBody(authValidationSchema.login), asyncHandler(adminLogin));

router.post(
  '/refresh-token',
  validateBody(authValidationSchema.freshToken),
  asyncHandler(refreshToken),
);

router.post('/logout', asyncHandler(userLogout));

router.post('/request-reset-code', asyncHandler(requestResetCode));
router.post('/verify-reset-code', asyncHandler(verifyResetCode));
router.post('/reset-password', asyncHandler(resetPassword));

export default router;
