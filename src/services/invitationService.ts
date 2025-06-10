import { generateInvitationLink } from '../utils/invitationLink';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '../types/invitation';
import { EXPIRES_TIME_CONFIG } from '../config';

export class InvitationService {
  static async generateInvitation({
    email,
    role,
  }: GenerateInvitationRequest): Promise<GenerateInvitationResponse> {
    const invitationLink = await generateInvitationLink(email, role);

    return {
      invitationLink,
      email,
      role,
      expiresIn: EXPIRES_TIME_CONFIG.EXPIRES_IN_DISPLAY,
    };
  }
}
