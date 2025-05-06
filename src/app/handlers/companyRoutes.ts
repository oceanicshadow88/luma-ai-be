import { Router } from 'express';
import { companyController } from '../../controllers/companyController';
import { authMiddleware } from '../middleware/auth'; // Authentication middleware

const router = Router();

router.post('/', authMiddleware, companyController.createCompany);

export default router;
