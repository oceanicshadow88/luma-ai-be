import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { InvitationService } from '../services/invitationService';
import { RoleType } from '../config';

export interface GenerateInvitationRequest extends Request {
  body: {
    email: string;
    role: RoleType;
  };
}

/**
 * Generate an invitation link
 */
export const generateInvitation = async (
  req: GenerateInvitationRequest,
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
