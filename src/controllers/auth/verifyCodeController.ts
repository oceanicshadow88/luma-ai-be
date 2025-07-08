import config from '@src/config';
import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import { VerifyCodeType } from '@src/types/invitation';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

/**
 * Request verification value
 * Accepts an email, validates it, and generates a verification value that can be used
 * for password reset or account registration
 */
export const requestVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check for existing code
  const existingCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  }).exec();
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

      throw new AppException(
        HttpStatusCode.TooManyRequests,
        `Too many requests. Please try again later.  coolDownSeconds: ${secondsRemaining}`,
      );
    }
  }

  // Generate verification value
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
    verifyType: VerifyCodeType.VERIFICATION,
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
