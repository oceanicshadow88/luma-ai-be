// Authentication and authorization
import { LocaleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import { registerService } from '@src/services/auth/registerService';
import { clearPendingUserData, getPendingUserData } from '@src/utils/storagePendingUser';
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

export const teacherRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;
  const { refreshToken, accessToken } = await registerService.teacherRegister(userInput);

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

export const handleOwnerRegistrationProcess = async (req: Request, res: Response) => {
  // Check fields
  const { companyName, plan, settings } = req.body;

  const logoUrl = req?.file ? `/uploads/company-logos/${req.file.filename}` : undefined;
  // get user from user register
  const pendingUser = getPendingUserData() as RegisterUserInput;
  if (!pendingUser) {
    throw new AppException(
      HttpStatusCode.BadRequest,
      'Missing user registration data, please return Admin Signup Page.',
    );
  }

  // company create do not need to check verify code, because it is created by admin user registration and verify code is verified in user register

  const result = await registerService.companyOwnerRegister({
    companyName,
    plan,
    settings,
    logoUrl,
    pendingUser,
  });

  clearPendingUserData();

  return res.status(201).json({
    message: 'User, Company and Membership created successfully',
    data: result,
  });
};
