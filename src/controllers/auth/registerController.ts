// Authentication and authorization
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import { registerService } from '@src/services/auth/registerService';
import { LocaleType, RoleType } from '@src/types/constants';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyValue: string;
  role?: RoleType;
  _id?: ObjectId;
}

export const learnerRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;
  // Create user and membership
  const { refreshToken, accessToken } = await registerService.learnerRegister(
    userInput,
    req.companyId.toString(),
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
  const { refreshToken, accessToken } = await registerService.instructorRegister(
    req.body as RegisterUserInput,
    req.companyId,
  );

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};

export const handleOwnerRegistrationProcess = async (req: Request, res: Response) => {
  // Check fields
  const { companyName, plan, settings, slug } = req.body;

  const logoUrl = req?.file ? `/uploads/company-logos/${req.file.filename}` : undefined;

  // company create do not need to check verify code, because it is created by user registration and verify code is verified in user register

  if (!req.user?.email) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      'Missing admin user for institution registration.',
    );
  }

  const { refreshToken, accessToken } = await registerService.registerCompanyWithOwner({
    companyName,
    plan,
    slug,
    settings,
    logoUrl,
    email: req.user?.email,
  });

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};

export const checkCompanyAvailability = async (req: Request, res: Response) => {
  const { companySlug } = req.params;
  const companyExists = await CompanyModel.exists({ slug: companySlug, active: true });
  res.status(200).json({
    available: !!companyExists as boolean,
  });
};
