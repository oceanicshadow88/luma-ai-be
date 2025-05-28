// authentication, authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
export interface RegistUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: string;
  verifyCode?: string;
}

export const adminRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authvalidation middleware
  // Get params from request body
  const userInput = req.body as RegistUserInput;

  // create user
  const { refreshToken, accessToken } = await registerService.userRegister(userInput);

  res.status(201).json({ refreshToken, accessToken });
};
