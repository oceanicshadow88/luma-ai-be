import { Request, Response, NextFunction,Router } from 'express';
import * as authController from '../../controllers/authController';
import { validateBody } from '../../middleware/validationMiddleware';
import authValidationSchema from '../../validations/userValidation';

const authRouter = Router();

// Handler wrapper to properly handle Express middleware types
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Apply the wrapper to each route handler
authRouter.post('/register',  validateBody(authValidationSchema.register), asyncHandler(authController.register));
authRouter.post('/login', validateBody(authValidationSchema.login), asyncHandler(authController.login));
authRouter.post('/refresh-token', asyncHandler(authController.refreshToken));
authRouter.post('/logout', asyncHandler(authController.logout));

export default authRouter;
