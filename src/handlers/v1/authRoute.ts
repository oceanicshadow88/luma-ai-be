import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import * as authController from '../../controllers/authController';

const authRouter = Router();

// Handler wrapper to properly handle Express middleware types
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Apply the wrapper to each route handler
authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/refresh-token', asyncHandler(authController.refreshToken));
authRouter.post('/logout', asyncHandler(authController.logout));

export default authRouter;
