import { passwordResetService } from '@src/services/passwordResetService';
import { Request, Response } from 'express';

/**
 * Reset password - This is now combined with verifyResetCode
 * This function is kept as a placeholder so existing routes still work
 * It redirects to the combined verifyResetCode function
 */
export const resetPassword = async (req: Request, res: Response) => {
  // This function now delegates to verifyResetCode for consistency
  return verifyResetCode(req, res);
};

/**
 * Combined verify code and reset password
 * Validates the verification value and resets the password in one step
 */
export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, verifyValue, newPassword } = req.body;
  const companyId = req.companyId;

  await passwordResetService(companyId, email, verifyValue, newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
  });
};
