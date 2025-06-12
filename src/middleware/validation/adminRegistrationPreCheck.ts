import { Request, Response, NextFunction } from 'express';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';
import { getSafePendingUserData, setPendingUserData } from '../../utils/storagePendingUser';
import { RegisterUserInput } from '../../controllers/auth/registerController';

export const validateRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username } = req.body;
  if (!email) {
    throw new AppException(HttpStatusCode.BadRequest, 'Email is required');
  }

  // check user with company exist
  const userExistWithEmail = await UserModel.findOne({ email });
  if (userExistWithEmail) {
    // user and company all exist
    res.status(400).json({
      message: 'User already exist with email, please login',
    });
    return;
  }
  const userExistWithUsername = await UserModel.findOne({ username });
  if (userExistWithUsername) {
    res.status(400).json({
      message: 'User already exist with username',
    });
    return;
  }

  // check company
  const companySlug = await extractCompanySlug(email);
  if (!companySlug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
  }
  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    throw new Error('Company does not exits');
  }

  // company exist, user not exist
  next();
};
