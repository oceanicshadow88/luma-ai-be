import { Router, Request, Response } from 'express';
import authRoutes from './authRoute';
import companyRoutes from './companyRoute';

const v1Router = Router();


// Mount routes
v1Router.use('/auth', authRoutes);
v1Router.use('/companies', companyRoutes);

// Health check route
v1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

export default v1Router;
