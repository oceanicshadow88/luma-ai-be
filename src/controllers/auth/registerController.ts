// authentication, authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyValue?: string;
}

export const adminRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authValidation middleware
  // Get params from request body
  const userInput = req.body as RegisterUserInput;

  // create user
  const { refreshToken, accessToken } = await registerService.adminRegister(userInput);

  res.status(201).json({ refreshToken, accessToken });
};

export const teacherRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authvalidation middleware
  // Get params from request body
  const userInput = req.body as RegisterUserInput;

  // create user
  const { refreshToken, accessToken } = await registerService.teacherRegister(userInput);

  res.status(201).json({ refreshToken, accessToken });
};
