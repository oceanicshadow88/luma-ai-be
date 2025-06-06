// authentication, authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
export interface RegistUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyCode?: string;
  termsAccepted?: boolean;
}

export const studentRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authvalidation middleware
  // Get params from request body
  const userInput = req.body as RegistUserInput;
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

  // create user
  const { refreshToken, accessToken } = await registerService.studentRegister(
    userInput,
    organizationId,
  );

  res.status(201).json({
    message: 'Successfully signed up! Redirecting...',
    refreshToken,
    accessToken,
    redirectUrl: `/organizations/${organizationId}/dashboard`,
  });
};

export const adminRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authvalidation middleware
  // Get params from request body
  const userInput = req.body as RegistUserInput;

  // create user
  const { refreshToken, accessToken } = await registerService.userRegister(userInput);

  res.status(201).json({ refreshToken, accessToken });
};
