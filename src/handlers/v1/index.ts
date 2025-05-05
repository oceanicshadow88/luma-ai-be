import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// Mount routes
router.use('/users', userRoutes);

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

export default router;
