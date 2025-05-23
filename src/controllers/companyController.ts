import { Request, Response, NextFunction } from 'express';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { extractCompanySlug } from '../utils/extractCompanySlugFromEmail';
import { userService } from '../services/userService';
import { companyService } from '../services/companyService';
import { Types } from 'mongoose';
import { membershipService } from '../services/membershipService';
import { ROLE } from '../config';
import { clearTempUserData, getTempUserData } from '../utils/tempUserDataStorage';
import { checkVerificationCode } from '../services/auth/registerService';

export const companyController = {
  createCompany: async (req: Request, res: Response, _next: NextFunction) => {

    const { companyName, plan, settings, user } = req.body;

    // get user from user register
    const pendingUser = user ?? getTempUserData();
    if (!pendingUser) {
      return res.status(400).json({ message: 'Missing user registration data' });
    }
    const { firstname, lastname, username, email, password, avatarUrl, locale, verifyCode } = pendingUser;
    clearTempUserData();

    // verify code
    if (verifyCode) {
      await checkVerificationCode(verifyCode, email);
    }

    // check company slug
    const slug = await extractCompanySlug(email);
    if (!slug) {
      throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
    }

    // create user
    const newUser = await userService.createUser({
      firstname,
      lastname,
      username,
      email,
      password,
      avatarUrl,
      locale,
    });
    newUser.save();
    // create company
    const newCompany = await companyService.createCompany({
      companyName,
      slug,
      plan,
      ownerId: newUser._id as Types.ObjectId,
      settings,
    });

    // create membership
    const newMembership = await membershipService.createMembership({
      userId: newUser.id.toString(),
      companyId: newCompany.id.toString(),
      role: ROLE.ADMIN,
      status: true,
    });

    return res.status(201).json({
      message: 'User, Company and Membership created successfully',
      data: {
        userId: newUser._id,
        companyId: newCompany._id,
        membershipId: newMembership._id,
      },
    });

  },
};
