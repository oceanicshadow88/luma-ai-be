import { Request, Response, NextFunction } from 'express';
import { ROUTES } from '../../config';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';
import { getSafePendingUserData, setPendingUserData } from '../../utils/storagePendingUser';
import { RegistUserInput } from '../../controllers/auth/registerController';

export const validateRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    throw new AppException(HttpStatusCode.BadRequest, 'Email is required');
  }

  // check company
  const companySlug = await extractCompanySlug(email);
  if (!companySlug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
  }
  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // company not exist, jump to company register and pass user data
    const user = req.body as RegistUserInput;
    setPendingUserData(user);

    res.status(302).json({
      message: 'The company does not exist',
      redirect: ROUTES.REGISTER_COMPANY,
      user: getSafePendingUserData(),
    });
    return;
  }

  // check user with company exist
  const user = await UserModel.findOne({ email });
  if (user) {
    // user and company all exist
    res.status(302).json({
      message: 'User already exist, please login',
      redirect: ROUTES.LOGIN_USER,
    });
    return;
  }

  // company exist, user not exist
  next();
};
