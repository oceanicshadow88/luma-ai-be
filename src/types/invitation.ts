import { RoleType } from '@src/config';

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
