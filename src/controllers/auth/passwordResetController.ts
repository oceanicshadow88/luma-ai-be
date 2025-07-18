import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import logger from '@src/utils/logger';
import { HttpStatusCode } from 'axios';
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

  // Find user by email
  const user = await UserModel.findOne({ email }).exec();

  // User not exist still return true
  if (!user) {
    logger.error(`Reset password: user not exist with email: ${email}`);
    return res.status(200).json({
      success: true,
    });
  }

  // Find the reset code for this email
  const resetCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  }).exec();
  // Check if reset code exists
  if (!resetCode) {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      'Invalid or expired code. Please request a new one.',
      {
        field: 'verificationCode',
        payload: `ResetCode not exist with email ${email} for ${VerifyCodeType.VERIFICATION}`,
      },
    );
  }

  // Validate the reset code
  await resetCode.validateResetCode(verifyValue);

  // Code is valid - update the password
  user.password = newPassword;

  // Delete the reset code record
  await resetCode.deleteOne();

  // Invalidate all existing sessions
  user.refreshToken = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
  });
};
