// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authServer';
import UserModel from '../models/user';
import ResetCodeModel from '../models/resetCode';
import ValidationException from '../exceptions/validationException';
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
      verifyCode,
      locale,
    }: {
      firstname: string;
      lastname: string;
      username: string;
      password: string;
      email: string;
      avatarUrl?: string;
      verifyCode?: string;
      locale?: string;
    } = req.body;

    const { refreshToken } = await authService.registerUser({
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      verifyCode,
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
      return next(new ValidationException('Please enter your email address'));
    }

    if (!isValidEmail(email)) {
      return next(new ValidationException('Sorry, please type a valid email'));
    }

    // Check for existing reset code
    const existingCode = await ResetCodeModel.findOne({ email }).exec();
    const now = new Date();

    // Check for rate limiting
    if (
      existingCode &&
      existingCode.expiresAt > now &&
      now.getTime() - existingCode.expiresAt.getTime() + config.resetCodeExpiry * 1000 <
        config.resetCodeRateLimitExpiry * 1000
    ) {
      console.log('now.getTime():', now.getTime());
      console.log('existingCode.expiresAt.getTime():', existingCode.expiresAt.getTime());
      console.log('config.resetCodeExpiry * 1000:', config.resetCodeExpiry * 1000);
      // Calculate seconds remaining for cooldown
      const secondsRemaining = Math.ceil(
        (config.resetCodeRateLimitExpiry * 1000 -
          (now.getTime() - existingCode.expiresAt.getTime() + config.resetCodeExpiry * 1000)) /
          1000,
      );

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        cooldownSeconds: secondsRemaining,
      });
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
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email) {
      return next(new ValidationException('Please enter your email address'));
    }

    if (!code) {
      return next(new ValidationException('Please enter the verification code'));
    }

    if (!newPassword) {
      return next(new ValidationException('Please enter your new password'));
    }

    if (!confirmPassword) {
      return next(new ValidationException('Please confirm your password'));
    }

    if (!isValidEmail(email)) {
      return next(new ValidationException('Sorry, please type a valid email'));
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return next(new ValidationException('Passwords do not match'));
    }

    // Check password strength
    if (!isValidPassword(newPassword)) {
      return next(
        new ValidationException(
          'Password must be 8-20 characters and contain at least one uppercase letter, lowercase letter, number and special character',
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
      return res.status(400).json({
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
