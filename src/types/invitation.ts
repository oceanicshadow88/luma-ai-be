import { RoleType } from '../config';

export interface GenerateInvitationRequest {
  email: string;
  role: RoleType;
  companyId?: string;
}

export interface GenerateInvitationResponse {
  invitationLink: string;
  email: string;
  role: RoleType;
  expiresIn: string;
}
