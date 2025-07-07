import { config } from '@src/config';
import AppException from '@src/exceptions/appException';
import { HttpStatusCode } from 'axios';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

export type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

interface TokenPayload extends JwtPayload {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ResetTokenPayload extends JwtPayload {
  purpose: 'password-reset';
}

/**
 * JWT utility functions
 */
export const jwtUtils = {
  /**
   * Generate access token for authentication
   */
  generateAccessToken(payload: TokenPayload): string {
    const secret: Secret = config.jwt?.secret;
    const options: SignOptions = {
      expiresIn: (config.jwt?.expiresIn as StringValue) || '1d',
    };
    return jwt.sign(payload, secret, options);
  },

  /**
   * Generate a password reset token (separate from auth tokens)
   * @param payload - Data to include in the token
   * @param expiresIn - Optional custom expiration time (defaults to 15 minutes)
   */
  generatePasswordResetToken(
    payload: object,
    expiresIn: StringValue = '15m' as StringValue,
  ): string {
    const secret = config.jwt?.secret;
    const options: SignOptions = {
      expiresIn,
    };
    return jwt.sign({ ...payload, purpose: 'password-reset' }, secret, options);
  },

  /**
   * Verify a password reset token
   */
  verifyPasswordResetToken(token: string): ResetTokenPayload {
    const secret = config.jwt?.secret;
    const decoded = jwt.verify(token, secret) as ResetTokenPayload;

    if (decoded.purpose !== 'password-reset') {
      throw new AppException(HttpStatusCode.InternalServerError, 'Invalid token purpose');
    }
    return decoded;
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: TokenPayload): string {
    const secret: Secret = config.jwt?.refreshSecret;
    const options: SignOptions = {
      expiresIn: (config.jwt?.refreshExpiresIn as StringValue) || '7d',
    };
    return jwt.sign(payload, secret, options);
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | undefined {
    const secret: Secret = config.jwt?.secret;
    return jwt.verify(token, secret) as TokenPayload;
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    const secret: Secret = config.jwt?.refreshSecret;
    return jwt.verify(token, secret) as TokenPayload;
  },
};
