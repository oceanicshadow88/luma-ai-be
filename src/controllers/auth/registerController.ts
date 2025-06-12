// Authentication and authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyCode: string;
}

export const adminRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  const { refreshToken, accessToken } = await registerService.adminRegister(userInput);

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};

export const learnerRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  if (userInput.password !== userInput.confirmPassword) {
    throw new AppException(HttpStatusCode.BadRequest, 'Passwords do not match');
  }

  // Create user and membership
  if (!req.companySlug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Missing company slug from Request');
  }
  const { refreshToken, accessToken } = await registerService.learnerRegister(
    userInput,
    req.companySlug,
  );

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};
