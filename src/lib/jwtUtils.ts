import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config';

// Default values in case configuration isn't set
const DEFAULT_JWT_SECRET: Secret = 'your-secret-key-should-be-in-env-file';
const DEFAULT_JWT_EXPIRES_IN = '1d';
const DEFAULT_JWT_REFRESH_EXPIRES_IN = '7d';

/**
 * JWT utility functions
 */
export const jwtUtils = {
  /**
   * Generate access token
   */
  generateAccessToken(payload: object): string {
    const secret: Secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
    
    // Use type assertion to treat our string as any first to avoid TypeScript errors
    const options = {
      expiresIn: (config.jwt?.expiresIn || DEFAULT_JWT_EXPIRES_IN) as any
    };
    
    return jwt.sign(payload, secret, options);
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: object): string {
    const secret: Secret = config.jwt?.refreshSecret || DEFAULT_JWT_SECRET;
    
    // Use type assertion to treat our string as any first to avoid TypeScript errors
    const options = {
      expiresIn: (config.jwt?.refreshExpiresIn || DEFAULT_JWT_REFRESH_EXPIRES_IN) as any
    };
    
    return jwt.sign(payload, secret, options);
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): any {
    try {
      const secret: Secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): any {
    try {
      const secret: Secret = config.jwt?.refreshSecret || DEFAULT_JWT_SECRET;
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  },
};
