import { Router, Request, Response, NextFunction } from 'express';
// import userRoutes from './userRoute';
import authRouter from './authRoute';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const v1Router = Router();

// Mount routes
v1Router.use('/auth', authRouter);
// v1Router.use('/users', userRoutes);

// Health check route
v1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Create a wrapper for the protected test route to handle the type conversion
const protectedTestHandler = (req: Request, res: Response): void => {
  // Cast the request to AuthRequest to access the user property
  const authReq = req as AuthRequest;

  res.status(200).json({
    status: 'success',
    message: 'You have accessed a protected route',
    user: authReq.user,
  });
};

// Protected test route to verify JWT authentication
v1Router.get('/protected-test', authGuard, protectedTestHandler);

export default v1Router;
