import { InvitationService } from '@src/services/invitationService';
import { GenerateInvitationRequest } from '@src/types/invitation';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

/**
 * Generate an invitation link
 */
export const generateInvitation = async (
  req: Request<{}, {}, GenerateInvitationRequest>,
  res: Response,
): Promise<void> => {
  const { email, role } = req.body;

  const result = await InvitationService.generateInvitation({
    email,
    role,
  });
  res.status(HttpStatusCode.Ok).json({
    success: true,
    message: 'Invitation link generated successfully',
    data: result,
  });
};
