import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { InvitationService } from '../services/invitationService';
import { GenerateInvitationRequest } from '../types/invitation';

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
