import jwt, { Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config';

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
  generatePasswordResetToken(payload: object, expiresIn = '15m'): string {
    const secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
    // Convert string or unknown types to any to satisfy TypeScript
    const options = {
      expiresIn,
    } as any;

    return jwt.sign({ ...payload, purpose: 'password-reset' }, secret, options);
  },

  /**
   * Verify a password reset token
   */
  verifyPasswordResetToken(token: string): any {
    try {
      const secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
      const decoded = jwt.verify(token, secret);

      // Ensure the token was created for password reset
      if (typeof decoded === 'object' && decoded !== null && decoded.purpose === 'password-reset') {
        return decoded;
      }

      throw new Error('Invalid token purpose');
    } catch (error) {
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
      throw error;
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
      throw error;
    }
  },
};
