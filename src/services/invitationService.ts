import { RoleType } from '../config';
import { generateInvitationLink } from '../utils/invitationLink';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';

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
    try {
      const invitationLink = await generateInvitationLink(email, role);

      return {
        invitationLink,
        email,
        role,
        expiresIn: '24 hours',
      };
    } catch {
      throw new AppException(
        HttpStatusCode.InternalServerError,
        'Failed to generate invitation link',
      );
    }
  }
}
