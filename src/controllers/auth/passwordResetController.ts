import { ROLE, RoleType } from '@src/config';
import { passwordResetService } from '@src/services/auth/passwordResetService';
import { Request, Response } from 'express';

/**
 * Reset password - This is now combined with verifyResetCode
 * This function is kept as a placeholder so existing routes still work
 * It redirects to the combined verifyResetCode function
 */
export const resetPasswordEnterprise = async (req: Request, res: Response) => {
  // This function now delegates to verifyResetCode for consistency
  return verifyResetCode(req, res, [ROLE.ADMIN, ROLE.INSTRUCTOR]);
};

export const resetPasswordLearner = async (req: Request, res: Response) => {
  // This function now delegates to verifyResetCode for consistency
  return verifyResetCode(req, res, [ROLE.LEARNER]);
};

/**
 * Combined verify code and reset password
 * Validates the verification value and resets the password in one step
 */
export const verifyResetCode = async (req: Request, res: Response, allowedRoles: RoleType[]) => {
  const { email, verifyValue, newPassword } = req.body;
  const slug = req.company.slug;

  await passwordResetService({
    email,
    verifyValue,
    newPassword,
    slug,
    allowedRoles,
  });

  return res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
  });
};
