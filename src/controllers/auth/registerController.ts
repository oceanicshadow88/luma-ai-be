// Authentication and authorization
import { LocaleType, RoleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import UserModel, { User } from '@src/models/user';
import { registerService } from '@src/services/auth/registerService';
import { companyService } from '@src/services/companyService';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ObjectId, Types } from 'mongoose';

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

  // check company slug
  const companyExistBySlug = await CompanyModel.findOne({ slug });
  if (companyExistBySlug) {
    throw new AppException(HttpStatusCode.Conflict, 'Slug already in use. Try a different one.', {
      field: 'slug',
    });
  }

  // create user
  let user: User | null = await UserModel.findOne({ email: req.user?.email });
  if (!user) {
    throw new AppException(HttpStatusCode.Unauthorized, 'User not found');
  }
  // create company
  const newCompany = await companyService.createCompany({
    companyName,
    slug,
    plan,
    owner: user._id as Types.ObjectId,
    logoUrl,
    settings,
  });
  if (!newCompany._id) {
    throw new AppException(HttpStatusCode.InternalServerError, 'Company creation failed');
  }
  user.company = newCompany._id as Types.ObjectId;
  await user.save();

  return res.status(201).json({
    message: 'User, Company and Membership created successfully',
    data: {
      user: user._id,
      company: newCompany._id,
    },
  });
};

export const checkCompanyAvailability = async (req: Request, res: Response) => {
  const { companySlug } = req.params;
  const companyExists = await CompanyModel.exists({ slug: companySlug, active: true });
  res.status(200).json({
    available: !!companyExists as boolean,
  });
};
