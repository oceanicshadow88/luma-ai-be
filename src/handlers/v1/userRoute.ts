import { Router } from 'express';
import { userController } from '../../controllers/userController';
import { validateBody, validateQuery } from '../../middleware/validation/validationMiddleware';
import { userValidateSchema } from '../../validations/userValidaion';
import { registerRoutes } from '../../utils/registerRoutes';

const router = Router();

registerRoutes(router, [
    {
        method: 'get',
        path: '/',
        middlewares: [validateQuery(userValidateSchema.search)],
        handler: userController.getAllUsers,
    },
    {
        method: 'get',
        path: '/:id',
        handler: userController.getUserById,
    },
    {
        method: 'put',
        path: '/:id',
        middlewares: [validateBody(userValidateSchema.update)],
        handler: userController.updateUserById,
    },
    {
        method: 'delete',
        path: '/:id',
        handler: userController.deleteUserById,
    },
]);

export default router;
