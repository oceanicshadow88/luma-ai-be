// Authentication and authorization
import { Request, Response } from 'express';
import { ObjectId, Types } from 'mongoose';
import { LocaleType, ROLE } from 'src/config';

import { registerService } from '../../services/auth/registerService';
import { HttpStatusCode } from 'axios';
import AppException from '../../exceptions/appException';
import UserModel, { User } from '../../models/user';
import { companyService } from '../../services/companyService';
import { membershipService } from '../../services/membershipService';
import { userService } from '../../services/userService';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';
import { getPendingUserData, clearPendingUserData } from '../../utils/storagePendingUser';

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

export const  handleOwnerRegistrationProcess = async (req: Request, res: Response) => {
    // Check fields
    const { companyName, plan, settings } = req.body;
    if (!companyName) {
      throw new AppException(HttpStatusCode.BadRequest, 'Missing required fields');
    }
    const logoUrl = req?.file ? `/uploads/company-logos/${req.file.filename}` : undefined;
    // get user from user register
    const pendingUser = getPendingUserData() as RegisterUserInput;
    if (!pendingUser) {
      return res.status(400).json({ message: 'Missing user registration data' });
    }

    // company create do not need to check verify code, // because it is created by user registration and verify code is verified in user register

    // check company slug
    const slug = await extractCompanySlug(pendingUser.email);
    if (!slug) {
      throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
    }

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
  }
