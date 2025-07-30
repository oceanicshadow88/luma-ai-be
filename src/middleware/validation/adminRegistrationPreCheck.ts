import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
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
  const { email, verifyValue, token } = req.body;
  if (token) {
    next();
    return;
  }
  // TODO: this user already exist in this company
  // await userService.checkUserConflict(email, username);
  //Need to spereate the username check and also email check

  // check company
  const companySlug = await extractCompanySlug(email);

  // check verification value, error will be thrown if verification value is not valid
  await checkVerificationCode(verifyValue, email);

  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // company not exist, jump to company register and pass user data
    const user = req.body as RegisterUserInput;
    setPendingUserData(user);

    throw new AppException(
      HttpStatusCode.Unauthorized, //TODO change to something else
      'No existing institution found. Please create your organization.',
      { payload: { user: getSafePendingUserData() } },
    );
  }

  // company exist, user not exist
  next();
};
