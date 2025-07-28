import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import { checkVerificationCode } from '@src/services/auth/registerService';
import { userService } from '@src/services/userService';
import { extractCompanySlugFromEmail } from '@src/utils/extractCompanySlugFromEmail';
import { getSafePendingUserData, setPendingUserData } from '@src/utils/storagePendingUser';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export const adminRegistrationPreCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, verifyValue } = req.body;

  await userService.checkUserConflict(email, username);

  // check company
  const companySlug = await extractCompanySlugFromEmail(email);

  // check verification value, error will be thrown if verification value is not valid
  await checkVerificationCode(verifyValue, email);

  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // company not exist, jump to company register and pass user data
    const user = req.body as RegisterUserInput;
    setPendingUserData(user);

    throw new AppException(
      HttpStatusCode.Unauthorized,
      'No existing institution found. Please create your organization.',
      { payload: { user: getSafePendingUserData() } },
    );
  }

  // company exist, user not exist
  next();
};
