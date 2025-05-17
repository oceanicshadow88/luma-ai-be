import { Request, Response, NextFunction } from 'express';
import { isValidEmail, isValidPassword } from '../utils';
import UserModel from '../models/user';
import ResetCodeModel from '../models/resetCode';
import config from '../config';
import ValidationException from '../exceptions/validationException';

/**
 * Request password reset code
 * Accepts an email, validates it, and generates a verification code if the email exists
 */
export const requestResetCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Email validation
    if (!email) {
      return next(new ValidationException('Please enter your email address'));
    }

    if (!isValidEmail(email)) {
      return next(new ValidationException('Sorry, please type a valid email'));
    }

    // Check for existing reset code
    const existingCode = await ResetCodeModel.findOne({ email }).exec();
    const now = new Date();

    // Check for rate limiting
    if (existingCode) {
      // Calculate when the code was created (expiresAt minus the expiry duration)
      const codeCreationTime = new Date(
        existingCode.expiresAt.getTime() - config.resetCodeExpiry * 1000,
      );
      // Calculate how long ago the code was created
      const timeSinceCreation = now.getTime() - codeCreationTime.getTime();
      // If less than the rate limit cooldown time has passed since creation
      if (timeSinceCreation < config.resetCodeRateLimitExpiry * 1000) {
        // Calculate seconds remaining for cooldown
        const secondsRemaining = Math.ceil(
          (config.resetCodeRateLimitExpiry * 1000 - timeSinceCreation) / 1000,
        );

        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          cooldownSeconds: secondsRemaining,
        });
      }
    }

    // Generate verification code
    const verificationCode = '888888';

    // Calculate expiry time (current time + 15 minutes)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    // Delete any existing reset codes for this email
    if (existingCode) {
      await existingCode.deleteOne();
    }

    // Store code in reset code collection
    await ResetCodeModel.create({
      email,
      code: verificationCode,
      expiresAt: expiryTime,
      attempts: 0,
    });

    // Skip sending email for now - this will be implemented later
    // await sendVerificationCodeEmail(email, verificationCode);

    // Return success response with the code (in production, this would be removed)
    return res.status(200).json({
      success: true,
      message: 'Verification code has been generated.',
      // Only for development/testing - would be removed in production
      code: verificationCode,
      expiresAt: expiryTime,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Combined verify code and reset password
 * Validates the verification code and resets the password in one step
 */
export const verifyResetCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validation
    if (!email) {
      return res.status(422).json({
        success: false,
        message: 'Please enter your email address',
      });
    }

    if (!code) {
      return res.status(422).json({
        success: false,
        message: 'Please enter the verification code',
      });
    }

    if (!newPassword) {
      return res.status(422).json({
        success: false,
        message: 'Please enter a new password',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(422).json({
        success: false,
        message: 'Sorry, please type a valid email',
      });
    }

    // Check password strength
    if (!isValidPassword(newPassword)) {
      return res.status(422).json({
        success: false,
        message:
          'Password must be 8-20 characters and contain at least one uppercase letter, lowercase letter, number and special character',
      });
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
    const resetCode = await ResetCodeModel.findOne({ email }).exec();

    // Check if reset code exists
    if (!resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code. Please request a new one.',
      });
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
    await user.hashPassword();

    // Delete the reset code record
    await resetCode.deleteOne();

    // Invalidate all existing sessions
    user.refreshToken = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset password - This is now combined with verifyResetCode
 * This function is kept as a placeholder so existing routes still work
 * It redirects to the combined verifyResetCode function
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  return verifyResetCode(req, res, next);
};
