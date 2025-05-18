import { Router } from 'express';
import { userController } from '../../controllers/userController';
import { validateBody, validateQuery } from '../../middleware/validation/validationMiddleware';
import { userValidateSchema } from '../../validations/userValidaion';

const router = Router();

// User routes
router.get('/', validateQuery(userValidateSchema.search), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validateBody(userValidateSchema.update), userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

export default router;
