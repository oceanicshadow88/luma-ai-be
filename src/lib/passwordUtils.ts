import * as crypto from 'crypto';

/**
 * Password utility functions
 */
export const passwordUtils = {
  /**
   * Generate a salt for password hashing
   */
  generateSalt: (length = 16): string => {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Hash a password with a salt
   */
  hashPassword: (password: string, salt: string): string => {
    return crypto
      .createHmac('sha256', salt)
      .update(password)
      .digest('hex');
  },

  /**
   * Verify a password against a hash
   */
  verifyPassword: (
    inputPassword: string,
    hashedPassword: string,
    salt: string
  ): boolean => {
    const hashed = crypto
      .createHmac('sha256', salt)
      .update(inputPassword)
      .digest('hex');
    return hashed === hashedPassword;
  },
};
