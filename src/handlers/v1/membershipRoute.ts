import { Router, RequestHandler } from 'express';
import { validateMembership } from '../../validations/membershipValidation';
import { membershipController } from '../../controllers/membershipController';
import { authGuard } from '../../middleware/authGuard';

const router = Router();

// Get user memberships
router.get(
  '/me',
  authGuard as RequestHandler,
  membershipController.getCurrentUserMemberships as RequestHandler,
);

// Update membership
router.patch(
  '/:id',
  authGuard as RequestHandler,
  validateMembership.updateMembership as unknown as RequestHandler[],
  membershipController.updateMembership as RequestHandler,
);

// Accept invite
router.post(
  '/invites/:token/accept',
  validateMembership.acceptInvite as unknown as RequestHandler[],
  membershipController.acceptInvite as RequestHandler,
);

export default router;
