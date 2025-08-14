import { requestVerificationCodeService } from '@src/services/verificationService';
import { Request, Response } from 'express';

/**
 * Request verification value
 * Accepts an email, validates it, and generates a verification value that can be used
 * for password reset or account registration
 */
export const requestVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  await requestVerificationCodeService(email);

  // Return success response with the code (in production, this would be removed)
  return res.status(200).json({
    success: true,
  });
};
