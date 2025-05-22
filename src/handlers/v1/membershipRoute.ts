import { Router, RequestHandler } from 'express';
import { validateMembership } from '../../validations/membershipValidation';
import { membershipController } from '../../controllers/membershipController';
import { authGuard } from '../../middleware/authGuard';
import { registerRoutes } from '../../utils/registerRoutes';

const router = Router();

registerRoutes(router, [

]);

export default router;
