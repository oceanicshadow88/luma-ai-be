import { EXPIRES_TIME_CONFIG } from '@src/config';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '@src/types/invitation';
import { generateInvitationLink } from '@src/utils/invitationLink';

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
