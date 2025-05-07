import { Router, Request, Response } from 'express';
import authRouter from './authRoute';

const v1Router = Router();

// Mount routes
v1Router.use('/auth', authRouter);
// v1Router.use('/users', userRoutes);

// Health check route
v1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

export default v1Router;
