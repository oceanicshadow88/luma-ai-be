// Authentication and authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
import AppException from '../../exceptions/appException';
import { extractSubdomain } from '../../lib/extractSubdomain';
import CompanyModel from '../../models/company';
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
  verifyValue: string;
}

export const learnerRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  if (userInput.password !== userInput.confirmPassword) {
    throw new AppException(HttpStatusCode.BadRequest, 'Passwords do not match');
  }

  // Get company slug from subdomain
  const companySlug = await extractSubdomain(req);

  // Find company by slug
  const company = await CompanyModel.findOne({ slug: companySlug });
  if (!company || !company._id) {
    throw new AppException(HttpStatusCode.BadRequest, 'Company not exist');
  }

  // Create user and membership
  const { refreshToken, accessToken } = await registerService.learnerRegister(
    userInput,
    company._id.toString(),
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

export const teacherRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;
  await registerService.teacherRegister(userInput);

  res.sendStatus(201);
};
