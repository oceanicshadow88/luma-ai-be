// authentication, authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
import { checkVerificationCode } from '../../services/auth/registerService';
import AppException from '../../exceptions/appException';

export interface RegisterUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
<<<<<<< HEAD
  verifyCode: string;
=======
  verifyCode?: string;
  termsAccepted?: boolean;
>>>>>>> e6974a8 (feat: add student registration logic)
}

export const studentRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authvalidation middleware
  // Get params from request body
  const userInput = req.body as RegisterUserInput;
  const { organizationId } = req.params;

  if (!organizationId) {
    return res.status(400).json({
      message: 'Organization ID is required',
    });
  }

  if (!userInput.termsAccepted) {
    return res.status(400).json({
      message: 'You must agree to the terms to continue.',
    });
  }

  // Validate verification code
  if (!userInput.verifyCode) {
    return res.status(400).json({
      message: 'Verification code is required',
    });
  }

  try {
    // Verify the code
    await checkVerificationCode(userInput.verifyCode, userInput.email);

    // Create user and membership
    const { refreshToken, accessToken } = await registerService.studentRegister(
      userInput,
      organizationId,
    );

    res.status(201).json({
      message: 'Successfully signed up! Redirecting...',
      refreshToken,
      accessToken,
      redirectUrl: `/organizations/${organizationId}/dashboard`,
      redirectDelay: 3000, // 3 seconds delay
    });
  } catch (error: unknown) {
    if (error instanceof AppException) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'An error occurred during registration',
    });
  }
};

export const adminRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authValidation middleware
  // Get params from request body
  const userInput = req.body as RegisterUserInput;

  // create user
  const { refreshToken, accessToken } = await registerService.userRegister(userInput);

  res.status(201).json({ refreshToken, accessToken });
};
