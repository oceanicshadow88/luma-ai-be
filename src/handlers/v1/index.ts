import { Router, Request, Response } from 'express';
import userRoutes from './userRoute';
import authRouter from './authRoute';
import { authGuard } from '../../middleware/authGuard';
import companyRoute from './companyRoute';
import membershipRoute from './membershipRoute';

const v1Router = Router();

// Mount routes
v1Router.use('/auth', authRouter);
v1Router.use('/users', userRoutes);
v1Router.use('/companies', companyRoute);
v1Router.use('/memberships', membershipRoute);

// Health check route
v1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Protected test route handler
interface AuthUser {
  _id: string;
  email: string;
  role: string;
  name: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const protectedTestHandler = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    message: 'You have accessed a protected route',
    user: req.user,
  });
};

// Protected test route to verify JWT authentication
v1Router.get('/protected-test', authGuard, protectedTestHandler);

export default v1Router;
