import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import { isValidEmail, isValidPassword } from '@src/utils';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

/**
 * Combined verify code and reset password
 * Validates the verification value and resets the password in one step
 */
export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  // Validation
  if (!email) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please enter your email address');
  }

  if (!code) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please enter the verification code');
  }

  if (!newPassword) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please enter your new password');
  }

  if (!isValidEmail(email)) {
    throw new AppException(HttpStatusCode.BadRequest, 'Sorry, please type a valid email');
  }

  // Check password strength
  if (!isValidPassword(newPassword)) {
    throw new AppException(
      HttpStatusCode.BadRequest,
      'Password must be 8-20 characters and contain at least one uppercase letter, lowercase letter, number and special character',
    );
  }

  // Find user by email
  const user = await UserModel.findOne({ email }).exec();

  // Check if user exists
  if (!user) {
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
      HttpStatusCode.BadRequest,
      'Invalid or expired code. Please request a new one.',
    );
  }

  // Validate the reset code
  const validationResult = await resetCode.validateResetCode(code);

  if (!validationResult.isValid) {
    return res.status(429).json({
      success: false,
      message: validationResult.message,
    });
  }

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

/**
 * Reset password - This is now combined with verifyResetCode
 * This function is kept as a placeholder so existing routes still work
 * It redirects to the combined verifyResetCode function
 */
export const resetPassword = async (req: Request, res: Response) => {
  // This function now delegates to verifyResetCode for consistency
  return verifyResetCode(req, res);
};
