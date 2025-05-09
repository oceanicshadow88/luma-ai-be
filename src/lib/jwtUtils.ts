import jwt, { Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config';

// Default values in case configuration isn't set
const DEFAULT_JWT_SECRET: Secret = 'your-secret-key-should-be-in-env-file';
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
   * Generate access token
   */
  generateAccessToken(payload: TokenPayload): string {
    const secret: Secret = config.jwt?.secret || DEFAULT_JWT_SECRET;
<<<<<<< HEAD
    const options: SignOptions = {
      expiresIn: (config.jwt?.expiresIn as StringValue) || DEFAULT_JWT_EXPIRES_IN,
||||||| 99c1a32
    
    // Use type assertion to treat our string as any first to avoid TypeScript errors
    const options = {
      expiresIn: (config.jwt?.expiresIn || DEFAULT_JWT_EXPIRES_IN) as any
=======

    // Use type assertion to treat our string as any first to avoid TypeScript errors
    const options = {
      expiresIn: (config.jwt?.expiresIn || DEFAULT_JWT_EXPIRES_IN) as any,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
    };
<<<<<<< HEAD
||||||| 99c1a32
    
=======

>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
    return jwt.sign(payload, secret, options);
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: TokenPayload): string {
    const secret: Secret = config.jwt?.refreshSecret || DEFAULT_JWT_SECRET;
<<<<<<< HEAD
    const options: SignOptions = {
      expiresIn: (config.jwt?.refreshExpiresIn as StringValue) || DEFAULT_JWT_REFRESH_EXPIRES_IN,
||||||| 99c1a32
    
    // Use type assertion to treat our string as any first to avoid TypeScript errors
    const options = {
      expiresIn: (config.jwt?.refreshExpiresIn || DEFAULT_JWT_REFRESH_EXPIRES_IN) as any
=======

    // Use type assertion to treat our string as any first to avoid TypeScript errors
    const options = {
      expiresIn: (config.jwt?.refreshExpiresIn || DEFAULT_JWT_REFRESH_EXPIRES_IN) as any,
>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
    };
<<<<<<< HEAD
||||||| 99c1a32
    
=======

>>>>>>> 3a132484c3dd607c9420aa0d48f120136f33d6d3
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
