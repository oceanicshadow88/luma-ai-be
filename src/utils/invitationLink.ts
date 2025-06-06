import jwt, { Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { RoleType } from '../config';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import ResetCodeModel from '../models/resetCode';

interface InvitationTokenPayload extends JwtPayload {
  email: string;
  role: RoleType;
  purpose: 'invitation';
}

/**
 * Generate an invitation link with JWT token and store in database
 * @param email - The email address of the invitee
 * @param role - The role to be assigned (INSTRUCTOR or STUDENT)
 * @returns A complete signup URL with the invitation token
 */
export async function generateInvitationLink(email: string, role: RoleType): Promise<string> {
  const secret: Secret = config.jwt?.secret;
  const payload: InvitationTokenPayload = {
    email,
    role,
    purpose: 'invitation',
  };

  const options: SignOptions = {
    expiresIn: '24h', // 24 hours expiration
  };

  const token = jwt.sign(payload, secret, options);

  // Store the token in the database (similar to reset code)
  // Remove any existing invitation tokens for this email
  await ResetCodeModel.deleteMany({ email, code: { $regex: '^invitation_' } });

  // Store the new invitation token with prefix to distinguish from reset codes
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

  await ResetCodeModel.create({
    email,
    code: `invitation_${token}`, // Prefix to distinguish from reset codes
    expiresAt,
    attempts: 0,
  });

  const signupBaseUrl = 'http://localhost:5173/auth/signup';
  return `${signupBaseUrl}?token=${token}`;
}

/**
 * Verify an invitation token against both JWT and database
 * @param token - The JWT invitation token to verify
 * @returns The decoded token payload containing email and role
 * @throws AppException if token is invalid, expired, or not found in database
 */
export async function verifyInvitationToken(token: string): Promise<InvitationTokenPayload> {
  try {
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
      code: `invitation_${token}`,
    });

    if (!invitationRecord) {
      throw new AppException(
        HttpStatusCode.Unauthorized,
        'Invitation token not found or has been used.',
      );
    }

    // Use the existing validateResetCode method to check expiration and attempts
    const validation = await invitationRecord.validateResetCode(`invitation_${token}`);

    if (!validation.isValid) {
      throw new AppException(HttpStatusCode.Unauthorized, validation.message);
    }

    // If validation is successful, delete the token (one-time use)
    await invitationRecord.deleteOne();

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppException(
        HttpStatusCode.Unauthorized,
        'Invitation token has expired. Please request a new invitation.',
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid invitation token.');
    }

    if (error instanceof AppException) {
      throw error;
    }

    throw new AppException(
      HttpStatusCode.InternalServerError,
      'Failed to verify invitation token.',
    );
  }
}
