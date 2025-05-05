import * as bcryptjs from 'bcryptjs';

/**
 * Password utility functions
 */
export const passwordUtils = {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcryptjs.hash(password, saltRounds);
  },

  /**
   * Verify a password against a hash
   */
  async verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcryptjs.compare(inputPassword, hashedPassword);
  },
};
