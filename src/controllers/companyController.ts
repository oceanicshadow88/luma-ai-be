import { Request, Response } from 'express';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { userService } from '../services/userService';
import { companyService } from '../services/companyService';
import { Types } from 'mongoose';
import { membershipService } from '../services/membershipService';
import { ROLE } from '../config';
import { clearPendingUserData, getPendingUserData } from '../utils/storagePendingUser';
import { checkVerificationCode } from '../services/auth/registerService';
import { RegisterUserInput } from './auth/registerController';
import UserModel, { User } from '../models/user';
import { extractCompanySlug } from '../utils/extractCompanySlugFromAdminEmail';

export const companyController = {
  createCompany: async (req: Request, res: Response) => {
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

    // verify code
    if (pendingUser.verifyValue) {
      await checkVerificationCode(pendingUser.verifyValue, pendingUser.email);
    }
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
  },
};
