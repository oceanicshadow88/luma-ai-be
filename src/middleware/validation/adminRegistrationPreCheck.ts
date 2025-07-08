import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import UserModel from '@src/models/user';
import { checkVerificationCode } from '@src/services/auth/registerService';
import { extractCompanySlug } from '@src/utils/extractCompanySlugFromEmail';
import { getSafePendingUserData, setPendingUserData } from '@src/utils/storagePendingUser';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export const adminRegistrationPreCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, verifyValue } = req.body;

  // check user with company exist
  const userExistWithEmail = await UserModel.findOne({ email });
  if (userExistWithEmail) {
    // user and company all exist
    throw new AppException(HttpStatusCode.Conflict, 'Email already registered. Please log in.');
  }
  const userExistWithUsername = await UserModel.findOne({ username });
  if (userExistWithUsername) {
    throw new AppException(
      HttpStatusCode.Conflict,
      'Username already in use. Try a different one.',
    );
  }

  // check company
  const companySlug = await extractCompanySlug(email);
  if (!companySlug) {
    throw new AppException(HttpStatusCode.UnprocessableEntity, 'Please provide work email');
  }

  // check verification value, error will be thrown if verification value is not valid
  await checkVerificationCode(verifyValue, email);

  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // company not exist, jump to company register and pass user data
    const user = req.body as RegisterUserInput;
    setPendingUserData(user);

    throw new AppException(
      HttpStatusCode.NotFound,
      'No existing institution found. Please create your organization.',
      { payload: { user: getSafePendingUserData() } },
    );
  }

  // company exist, user not exist
  next();
};
