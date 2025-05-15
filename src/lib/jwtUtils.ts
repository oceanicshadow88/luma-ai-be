import jwt, { Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import UnauthorizedException from '../exceptions/unauthorizedException';
import logger from '../utils/logger';

// Default values in case configuration isn't set
const DEFAULT_JWT_SECRET = 'your-secret-key-should-be-in-env-file';
const DEFAULT_JWT_EXPIRES_IN = '1d';
const DEFAULT_JWT_REFRESH_EXPIRES_IN = '7d';

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
    const secret: Secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
    const options: SignOptions = {
      expiresIn: (config.jwt?.expiresIn as StringValue) || DEFAULT_JWT_EXPIRES_IN,
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
    const secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
    const options: SignOptions = {
      expiresIn,
    };
    return jwt.sign({ ...payload, purpose: 'password-reset' }, secret, options);
  },

  /**
   * Verify a password reset token
   */
  verifyPasswordResetToken(token: string): ResetTokenPayload {
    try {
      const secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
      const decoded = jwt.verify(token, secret) as ResetTokenPayload;

      if (decoded.purpose !== 'password-reset') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      return decoded;
    } catch (error) {
      logger.error('Verify Password failed');
      throw error;
    }
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: TokenPayload): string {
    const secret: Secret = config.jwt?.refreshSecret || DEFAULT_JWT_SECRET;
    const options: SignOptions = {
      expiresIn: (config.jwt?.refreshExpiresIn as StringValue) || DEFAULT_JWT_REFRESH_EXPIRES_IN,
    };
    return jwt.sign(payload, secret, options);
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const secret: Secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedException('Verify Access Token failed', { payload: error });
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const secret: Secret = config.jwt?.refreshSecret || DEFAULT_JWT_SECRET;
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedException('Verify Fresh Token failed', { payload: error });
    }
  },
};
