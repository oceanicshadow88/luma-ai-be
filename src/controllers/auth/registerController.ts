// Authentication and authorization
import { LocaleType, ROLE } from '@src/config';
import AppException from '@src/exceptions/appException';
import UserModel, { User } from '@src/models/user';
import { registerService } from '@src/services/auth/registerService';
import { companyService } from '@src/services/companyService';
import { membershipService } from '@src/services/membershipService';
import { userService } from '@src/services/userService';
import { extractCompanySlug } from '@src/utils/extractCompanySlugFromEmail';
import { clearPendingUserData, getPendingUserData } from '@src/utils/storagePendingUser';
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
  const userInput = req.body as RegisterUserInput;
  const { refreshToken, accessToken } = await registerService.teacherRegister(userInput);

  res.status(201).json({
    message: 'Successfully signed up!',
    refreshToken,
    accessToken,
  });
};

export const handleOwnerRegistrationProcess = async (req: Request, res: Response) => {
  // Check fields
  const { companyName, plan, settings } = req.body;

  const logoUrl = req?.file ? `/uploads/company-logos/${req.file.filename}` : undefined;
  // get user from user register
  const pendingUser = getPendingUserData() as RegisterUserInput;
  if (!pendingUser) {
    throw new AppException(
      HttpStatusCode.BadRequest,
      'Missing user registration data, please return Admin Signup Page',
    );
  }

  // company create do not need to check verify code, // because it is created by user registration and verify code is verified in user register

  // check company slug
  const slug = await extractCompanySlug(pendingUser.email);

  // create user
  let newUser: User | null = await UserModel.findOne({ email: pendingUser.email });
  newUser ??= await userService.createUser(pendingUser);
  if (!newUser?._id) {
    throw new AppException(HttpStatusCode.InternalServerError, 'User creation failed');
  }

  // create company
  const newCompany = await companyService.createCompany({
    companyName,
    slug,
    plan,
    owner: newUser._id as Types.ObjectId,
    logoUrl,
    settings,
  });
  if (!newCompany._id) {
    throw new AppException(HttpStatusCode.InternalServerError, 'Company creation failed');
  }

  // create membership
  const newMembership = await membershipService.createMembership({
    user: newUser.id,
    company: newCompany.id,
    role: ROLE.ADMIN,
  });

  clearPendingUserData();
  return res.status(201).json({
    message: 'User, Company and Membership created successfully',
    data: {
      user: newUser._id,
      company: newCompany._id,
      membership: newMembership._id,
    },
  });
};
