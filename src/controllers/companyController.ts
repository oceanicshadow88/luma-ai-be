import { ROLE } from '@src/config';
import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import UserModel, { User } from '@src/models/user';
import { checkVerificationCode } from '@src/services/auth/registerService';
import { companyService } from '@src/services/companyService';
import { membershipService } from '@src/services/membershipService';
import { userService } from '@src/services/userService';
import { extractCompanySlug } from '@src/utils/extractCompanySlugFromEmail';
import { clearPendingUserData, getPendingUserData } from '@src/utils/storagePendingUser';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

export const companyController = {
  createCompany: async (req: Request, res: Response) => {
    // Check fields
    const { companyName, plan, settings } = req.body;
    if (!companyName) {
      throw new AppException(HttpStatusCode.BadRequest, 'Missing required fields');
    }
    const logoUrl = req.file ? `/uploads/company-logos/${req.file.filename}` : undefined;

    // get user from user register
    const pendingUser = getPendingUserData() as RegisterUserInput;
    if (!pendingUser) {
      return res.status(400).json({ message: 'Missing user registration data' });
    }

    // verify code
    if (pendingUser.verifyCode) {
      await checkVerificationCode(pendingUser.verifyCode, pendingUser.email);
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
