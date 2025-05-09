<<<<<<< HEAD
import { Router, Request, Response } from 'express';
||||||| 99c1a32

import { Router, Request, Response, NextFunction } from 'express';
=======
import { Router, Request, Response, NextFunction } from 'express';
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
// import userRoutes from './userRoute';
import authRouter from './authRoute';
import { authGuard } from '../../middleware/authGuard';

const v1Router = Router();

// Mount routes
v1Router.use('/auth', authRouter);
// v1Router.use('/users', userRoutes);

// Health check route
v1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Protected test route handler
const protectedTestHandler = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    message: 'You have accessed a protected route',
<<<<<<< HEAD
    user: req.user,
||||||| 99c1a32
    user: authReq.user
=======
    user: authReq.user,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
  });
};

// Protected test route to verify JWT authentication
v1Router.get('/protected-test', authGuard, protectedTestHandler);

export default v1Router;
