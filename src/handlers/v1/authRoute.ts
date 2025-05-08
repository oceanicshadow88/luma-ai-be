import { Router } from 'express';
import { register, login } from '../../controllers/authController';
import { validateBody } from '../../middleware/validationMiddleware';
import authValidationSchema from '../../validations/userValidation';

const authRouter = Router();

authRouter.post('/register', validateBody(authValidationSchema.register), register);
authRouter.post('/login', validateBody(authValidationSchema.login), login);

export default authRouter;
