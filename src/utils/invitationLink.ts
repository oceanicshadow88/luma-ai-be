import { HttpStatusCode } from 'axios';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

import { EXPIRES_TIME_CONFIG, ROLE, RoleType } from '../config';
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
): Promise<string> {
  const secret: Secret = config.jwt?.secret;
  const payload: InvitationTokenPayload = {
    email,
    role,
    purpose: 'invitation',
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

  if (role === ROLE.INSTRUCTOR) {
    // If the role is INSTRUCTOR, append the teacher path to the signup URL
    signupBaseUrl = `${signupBaseUrl}/teacher`;
  }
  return `${signupBaseUrl}?token=${token}`;
}

/**
 * Verify an invitation token against both JWT and database
 * @param token - The JWT invitation token to verify
 * @returns The decoded token payload containing email and role
 * @throws AppException if token is invalid, expired, or not found in database
 */
export async function verifyInvitationToken(token: string): Promise<InvitationTokenPayload> {
  // First, verify the JWT token structure and signature
  const secret: Secret = config.jwt?.secret;
  const decoded = jwt.verify(token, secret) as InvitationTokenPayload;

  if (decoded.purpose !== 'invitation') {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      'Invalid token purpose. This is not an invitation token.',
    );
  }
  // Check if token exists in database
  const invitationRecord = await ResetCodeModel.findOne({
    email: decoded.email,
    code: token,
    verifyType: VerifyCodeType.INVITATION,
  });

  if (!invitationRecord) {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      'Invitation token not found or has been used.',
    );
  }
  // Use the existing validateResetCode method to check expiration and attempts
  const validation = await invitationRecord.validateResetCode(token);

  if (!validation.isValid) {
    throw new AppException(HttpStatusCode.Unauthorized, validation.message);
  }

  // If validation is successful, delete the token (one-time use)
  await invitationRecord.deleteOne();

  return decoded;
}
