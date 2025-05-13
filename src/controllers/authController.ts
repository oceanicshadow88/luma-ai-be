// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authServer';
import UserModel from '../models/user';
import { jwtUtils } from '../lib/jwtUtils';
import { AppError } from '../error/errorApp';
import { isValidEmail, isValidPassword } from '../utils';
import config from '../config';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate Data - Joi validate schema: deal in route with authvalidation middleware
    // Get params from request body
    const {
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      locale,
    }: {
      firstname: string;
      lastname: string;
      username: string;
      password: string;
      email: string;
      avatarUrl?: string;
      locale?: string;
    } = req.body;

    const { refreshToken } = await authService.registerUser({
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      locale,
    });

    // request
    res.status(201).json({ success: true, data: { refreshToken } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const { refreshToken } = await authService.loginUser({ email, password });

    res.json({ success: true, data: { refreshToken } });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshAuthToken(refreshToken);

    res.json({ success: true, data: tokens });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset code
 * Accepts an email, validates it, and generates a verification code if the email exists
 */
export const requestResetCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Email validation
    if (!email) {
      return next(new AppError('Please enter your email address', 400));
    }

    if (!isValidEmail(email)) {
      return next(new AppError('Sorry, please type a valid email', 400));
    }

    // Find user by email
    const user = await UserModel.findOne({ email }).exec();

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This email is not registered',
      });
    }

    // Check for rate limiting (using MongoDB instead of Redis)
    const now = new Date();
    if (
      user.resetCodeExpiry &&
      user.resetCodeExpiry > now &&
      now.getTime() - user.resetCodeExpiry.getTime() + config.resetCodeExpiry * 1000 <
        config.resetCodeRateLimitExpiry * 1000
    ) {
      // Calculate seconds remaining for cooldown
      const secondsRemaining = Math.ceil(
        (config.resetCodeRateLimitExpiry * 1000 -
          (now.getTime() - user.resetCodeExpiry.getTime() + config.resetCodeExpiry * 1000)) /
          1000,
      );

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        cooldownSeconds: secondsRemaining,
      });
    }

    // Generate 6-digit verification code (for real implementation we'd use generateVerificationCode())
    const verificationCode = '888888'; // Hardcoded code for now

    // Calculate expiry time (current time + 15 minutes)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    // Store code in user document
    user.resetCode = verificationCode;
    user.resetCodeExpiry = expiryTime;
    user.resetCodeAttempts = 0;
    await user.save();

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
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email) {
      return next(new AppError('Please enter your email address', 400));
    }

    if (!code) {
      return next(new AppError('Please enter the verification code', 400));
    }

    if (!newPassword) {
      return next(new AppError('Please enter your new password', 400));
    }

    if (!confirmPassword) {
      return next(new AppError('Please confirm your password', 400));
    }

    if (!isValidEmail(email)) {
      return next(new AppError('Sorry, please type a valid email', 400));
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    // Check password strength
    if (!isValidPassword(newPassword)) {
      return next(
        new AppError(
          'Password must be 8-20 characters and contain at least one uppercase letter, lowercase letter, number and special character',
          400,
        ),
      );
    }

    // Find user by email
    const user = await UserModel.findOne({ email }).exec();

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This email is not registered',
      });
    }

    // Check if user has a valid reset code
    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code. Please request a new one.',
      });
    }

    // Check if code is expired
    if (user.resetCodeExpiry < new Date()) {
      // Clear expired code
      user.resetCode = undefined;
      user.resetCodeExpiry = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code. Please request a new one.',
      });
    }

    // Increment attempt counter to prevent brute force
    user.resetCodeAttempts = (user.resetCodeAttempts || 0) + 1;

    // Check for too many attempts (5 max)
    if (user.resetCodeAttempts >= 5) {
      // Clear code after too many attempts
      user.resetCode = undefined;
      user.resetCodeExpiry = undefined;
      user.resetCodeAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    // Verify the code (currently hardcoded to 888888)
    if (user.resetCode !== code) {
      await user.save(); // Save the incremented attempt counter

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code. Please request a new one.',
      });
    }

    // Code is valid - update the password
    user.password = newPassword;
    await user.hashPassword();

    // Clear the reset code and expiry
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    user.resetCodeAttempts = 0;

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
