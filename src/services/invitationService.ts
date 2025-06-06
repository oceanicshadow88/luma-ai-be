import { RoleType } from '../config';
import { generateInvitationLink } from '../utils/invitationLink';

export interface GenerateInvitationRequest {
  email: string;
  role: RoleType;
}

export interface GenerateInvitationResponse {
  invitationLink: string;
  email: string;
  role: RoleType;
  expiresIn: string;
}

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
      expiresIn: '24 hours',
    };
  }
}
