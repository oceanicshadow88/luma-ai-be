import { Request, Response, NextFunction, Router } from 'express';
import * as authController from '../../controllers/authController';
import { validateBody } from '../../middleware/validationMiddleware';
import authValidationSchema from '../../validations/userAuthValidation';
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

router.post('/login', validateBody(authValidationSchema.login), asyncHandler(authController.login));

router.post(
  '/refresh-token',
  validateBody(authValidationSchema.freshToken),
  asyncHandler(authController.refreshToken),
);

router.post('/logout', asyncHandler(authController.logout));

router.post('/request-reset-code', asyncHandler(authController.requestResetCode));
router.post('/verify-reset-code', asyncHandler(authController.verifyResetCode));
router.post('/reset-password', asyncHandler(authController.resetPassword));

export default router;
