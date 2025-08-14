import { RoleType } from '@src/types/constantsTypes';

// Verification/Reset value types enum for reuse across the application
export enum VerifyCodeType {
  VERIFICATION = 'verification',
  INVITATION = 'invitation',
}

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
