import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import AppException from '../../exceptions/appException';
import CompanyModel, { Company } from '../../models/company';
import UserModel from '../../models/user';
import { checkVerificationCode } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';

export const teacherRegistrationPreCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, verifyValue } = req.body;
  if (!email) {
    throw new AppException(HttpStatusCode.BadRequest, 'Email is required');
  }

  const userExistWithUsername = await UserModel.findOne({ username });
  if (userExistWithUsername) {
    res.status(400).json({
      message: 'User already exist with username',
    });
    return;
  }

  await checkVerificationCode(verifyValue, email);

  if (process.env.NODE_ENV === 'local') {
    const existCompany = await CompanyModel.findOne({ slug: 'default-company' });
    if (!existCompany) {
      throw new Error('Cannot not find default company');
    }
    req.company = existCompany as Company;
    req.companyId = existCompany._id as string;
  } else {
    // check company
    const companySlug = await extractCompanySlug(email);
    if (!companySlug) {
      throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
    }
    const existCompany = await CompanyModel.findOne({ slug: companySlug });
    if (!existCompany) {
      throw new Error('Company does not exits');
    }
  }
  // company exist, user not exist
  next();
};
