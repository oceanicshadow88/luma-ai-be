import { EXPIRES_TIME_CONFIG } from '@src/config/constants';
import { jwtUtils } from '@src/lib/jwtUtils';
import { USER_STATUS } from '@src/models/user';
import { RoleType } from '@src/types/constantsTypes';
import { HttpStatusCode } from 'axios';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

import { config } from '../config';
import AppException from '../exceptions/appException';
import ResetCodeModel from '../models/resetCode';
import { VerifyCodeType } from '../types/invitation';

interface InvitationTokenPayload extends JwtPayload {
  email: string;
  role: RoleType;
  purpose: 'invitation';
}

/**
 * Validate invitation token and return decoded payload and DB record
 * Throws AppException if invalid
 */
async function validateInvitationTokenAndRecord(token: string) {
  const decoded = jwtUtils.verifyAccessToken(token);
  if (!decoded) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid or expired token', {
      field: 'token',
      payload: 'Invalid token',
    });
  }
  if (decoded.purpose !== 'invitation') {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid or expired token', {
      field: 'token',
      payload: 'Invalid token purpose. This is not an invitation token.',
    });
  }
  const invitationRecord = await ResetCodeModel.findOne({
    email: decoded.email,
    code: token,
    verifyType: VerifyCodeType.INVITATION,
  });
  if (!invitationRecord) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid or expired token', {
      field: 'token',
      payload: 'Token not found or has been used.',
    });
  }
  return { decoded, invitationRecord };
}

/**
 * Generate an invitation link with JWT token and store in database
 * @param email - The email address of the invitee
 * @param role - The role to be assigned (INSTRUCTOR or LEARNER)
 * @param frontendBaseUrl - Frontend base URL for generating the invitation link
 * @returns A complete signup URL with the invitation token
 */
export async function generateInvitationLinkAndStoreToken(
  email: string,
  role: RoleType,
  frontendBaseUrl: string,
  id: string,
  companyId: string = '',
  status: USER_STATUS = USER_STATUS.INVITED,
): Promise<string> {
  const secret: Secret = config.jwt?.secret;
  const payload: InvitationTokenPayload = {
    email,
    role,
    id,
    status,
    purpose: 'invitation',
    companyId,
  };

  const options: SignOptions = {
    expiresIn: EXPIRES_TIME_CONFIG.EXPIRES_IN_JWT, // 24 hours expiration
  };

  const token = jwt.sign(payload, secret, options);
  // Store the token in the database (similar to reset code)
  // Remove any existing invitation tokens for this email
  await ResetCodeModel.deleteMany({
    email,
    verifyType: VerifyCodeType.INVITATION,
  });

  // Store the new invitation token with type to distinguish from other code types
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EXPIRES_TIME_CONFIG.EXPIRES_IN_HOURS); // 24 hours from now
  await ResetCodeModel.create({
    email,
    code: token, // Store the raw token instead of prefixed version
    verifyType: VerifyCodeType.INVITATION,
    expiresAt,
    attempts: 0,
  });

  // Use provided frontend base URL
  let signupBaseUrl = frontendBaseUrl;

  // Ensure the URL ends with /auth/signup
  if (!signupBaseUrl.includes('/auth/signup')) {
    signupBaseUrl = `${signupBaseUrl.replace(/\/$/, '')}/auth/signup`;
  }

  signupBaseUrl = `${signupBaseUrl}/${role}`;

  return `${signupBaseUrl}?token=${token}`;
}

/**
 * Verify an invitation token against both JWT and database
 * @param token - The JWT invitation token to verify
 * @throws AppException if token is invalid, expired, or not found in database
 */
export async function verifyInvitationToken(token: string): Promise<void> {
  const { invitationRecord } = await validateInvitationTokenAndRecord(token);
  // Use the existing validateResetCode method to check expiration and attempts
  await invitationRecord.validateResetCode(token);
  // If validation is successful, delete the token (one-time use)
  await invitationRecord.deleteOne();
}

// judge whether the invitation link(inside of token) exists
export async function VerifyInvitationLinkExist(token: string): Promise<boolean> {
  const { invitationRecord } = await validateInvitationTokenAndRecord(token);
  return !!invitationRecord;
}
