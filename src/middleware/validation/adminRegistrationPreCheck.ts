import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import { RegisterUserInput } from '../../controllers/auth/registerController';
import AppException from '../../exceptions/appException';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';
import { checkVerificationCode } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';
import { getSafePendingUserData, setPendingUserData } from '../../utils/storagePendingUser';

export const validateRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, verifyValue } = req.body;
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

  // check verification value, error will be thrown if verification value is not valid
  await checkVerificationCode(verifyValue, email);

  // check company
  const companySlug = await extractCompanySlug(email);
  if (!companySlug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
  }
  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // company not exist, jump to company register and pass user data
    const user = req.body as RegisterUserInput;
    setPendingUserData(user);

    res.status(302).json({
      message: 'The company does not exist',
      user: getSafePendingUserData(),
    });
    return;
  }

  // company exist, user not exist
  next();
};
