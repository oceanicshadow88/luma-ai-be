import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

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

  const result = await InvitationService.generateInvitation(
    {
      email,
      role,
    },
    req.companyId,
    req.frontendBaseUrl,
  );
  res.status(HttpStatusCode.Ok).json({
    success: true,
    message: 'Invitation link generated successfully',
    data: result,
  });
};
