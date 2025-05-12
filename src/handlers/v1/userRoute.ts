import { Router } from 'express';
import { userController } from '../../controllers/userController';

const router = Router();

// User routes
router.get('', userController.getAllUsers);

export default router;
