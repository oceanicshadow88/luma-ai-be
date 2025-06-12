// Authentication and authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { companyService } from '../../services/companyService';
import { Types } from 'mongoose';

export interface RegisterUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyCode: string;
}

export const learnerRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  if (userInput.password !== userInput.confirmPassword) {
    throw new AppException(HttpStatusCode.BadRequest, 'Passwords do not match');
  }

  // Get company slug from subdomain
  const company = await companyService.getCompanybyWorkEmail(userInput.email);
  if (!company || !company._id) {
    throw new AppException(HttpStatusCode.BadRequest, 'Company not exist');
  }

  // Create user and membership
  const { refreshToken, accessToken } = await registerService.learnerRegister(
    userInput,
    (company._id as Types.ObjectId).toString(),
  );

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};

export const adminRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  const { refreshToken, accessToken } = await registerService.adminRegister(userInput);

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};
