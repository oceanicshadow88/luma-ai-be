import { Router, RequestHandler } from 'express';
import { validateMembership } from '../../validations/membershipValidation';
import { membershipController } from '../../controllers/membershipController';
import { authGuard } from '../../middleware/authGuard';
import { registerRoutes } from '../../utils/registerRoutes';

const router = Router();


registerRoutes(router, [
  {// Get user memberships
    method: 'get',
    path: '/me',
    middlewares: [authGuard],
    handler: membershipController.getCurrentUserMemberships,
  },
  {// Update membership
    method: 'patch',
    path: '/:id',
    middlewares: [authGuard, ...validateMembership.updateMembership],
    handler: membershipController.updateMembership,
  },
  {
    method: 'post',
    path: '/invites/:token/accept',
    middlewares: [validateMembership.acceptInvite] as unknown as RequestHandler[],
    handler: membershipController.acceptInvite,
  },
]);

export default router;
