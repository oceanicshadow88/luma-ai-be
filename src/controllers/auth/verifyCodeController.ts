import config from '@src/config';
import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import { isValidEmail } from '@src/utils';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

/**
 * Request verification code
 * Accepts an email, validates it, and generates a verification code that can be used
 * for password reset or account registration
 */
export const requestVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Email validation
  if (!email) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please enter your email address');
  }

  if (!isValidEmail(email)) {
    throw new AppException(HttpStatusCode.UnprocessableEntity, 'Sorry, please type a valid email');
  }

  // Check for existing code
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
    // If less than the rate limit coolDown time has passed since creation
    if (timeSinceCreation < config.resetCodeRateLimitExpiry * 1000) {
      // Calculate seconds remaining for coolDown
      const secondsRemaining = Math.ceil(
        (config.resetCodeRateLimitExpiry * 1000 - timeSinceCreation) / 1000,
      );

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        coolDownSeconds: secondsRemaining,
      });
    }
  }

  // Generate verification code
  const verificationCode = '888888';

  // Calculate expiry time (current time + 15 minutes)
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 15);

  // Delete any existing codes for this email
  if (existingCode) {
    await existingCode.deleteOne();
  }

  // Store code in the database
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
  });
};

/**
 * Verify a verification code
 * This is a generic verification function that can be used by both
 * password reset and registration flows
 */
export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  // Validation
  if (!email) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please enter your email address');
  }

  if (!code) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please enter the verification code');
  }

  if (!isValidEmail(email)) {
    throw new AppException(HttpStatusCode.UnprocessableEntity, 'Sorry, please type a valid email');
  }
  // Find the code for this email
  const resetCode = await ResetCodeModel.findOne({ email }).exec();

  // Check if code exists
  if (!resetCode) {
    throw new AppException(
      HttpStatusCode.BadRequest,
      'Invalid or expired code. Please request a new one.',
    );
  }

  // Validate the code
  const validationResult = await resetCode.validateResetCode(code);

  if (!validationResult.isValid) {
    throw new AppException(HttpStatusCode.TooManyRequests, validationResult.message);
  }

  // Code is valid
  return res.status(200).json({
    success: true,
    message: 'Code verified successfully',
  });
};
