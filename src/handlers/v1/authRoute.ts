import { Request, Response, NextFunction, Router } from 'express';
import * as authController from '../../controllers/authController';
import { validateBody } from '../../middleware/validationMiddleware';
import authValidationSchema from '../../validations/userAuthValidation';

const router = Router();

<<<<<<< HEAD
// Helper function to handle async routes
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
||||||| 99c1a32
// Handler wrapper to properly handle Express middleware types
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
=======
// Handler wrapper to properly handle Express middleware types
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
  };

<<<<<<< HEAD
router.post(
  '/register',
  validateBody(authValidationSchema.register),
  asyncHandler(authController.register),
);
||||||| 99c1a32
// Apply the wrapper to each route handler
authRouter.post('/register',  validateBody(authValidationSchema.register), asyncHandler(authController.register));
authRouter.post('/login', validateBody(authValidationSchema.login), asyncHandler(authController.login));
authRouter.post('/refresh-token',validateBody(authValidationSchema.freshToken), asyncHandler(authController.refreshToken));
authRouter.post('/logout', asyncHandler(authController.logout));
=======
// Apply the wrapper to each route handler
authRouter.post(
  '/register',
  validateBody(authValidationSchema.register),
  asyncHandler(authController.register),
);
authRouter.post(
  '/login',
  validateBody(authValidationSchema.login),
  asyncHandler(authController.login),
);
authRouter.post(
  '/refresh-token',
  validateBody(authValidationSchema.freshToken),
  asyncHandler(authController.refreshToken),
);
authRouter.post('/logout', asyncHandler(authController.logout));
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3

router.post('/login', validateBody(authValidationSchema.login), asyncHandler(authController.login));

router.post(
  '/refresh-token',
  validateBody(authValidationSchema.freshToken),
  asyncHandler(authController.refreshToken),
);

router.post('/logout', asyncHandler(authController.logout));

export default router;
