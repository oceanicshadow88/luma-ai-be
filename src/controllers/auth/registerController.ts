// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { RegisterAction, registerService } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../utils/extractCompanySlugFromEmail';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { ROUTES } from '../../config';
import { setTempUserData } from '../../utils/tempUserDataStorage';

export interface RegistUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: string;
  verifyCode?: string;
}

export const adminRegister = async (req: Request, res: Response, _next: NextFunction) => {
  // Validate Data - Joi validate schema: deal in route with authvalidation middleware
  // Get params from request body

  const {
    firstname,
    lastname,
    username,
    password,
    email,
    avatarUrl,
    verifyCode,
    locale,
  } = req.body as RegistUserInput;;

  // get company slug
  const companySlug = await extractCompanySlug(email);
  if (!companySlug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
  }

  const { action, refreshToken } = await registerService.userRegister({
    firstname,
    lastname,
    username,
    password,
    email,
    avatarUrl,
    verifyCode,
    locale,
    companySlug,
  });

  switch (action) {
    // jump company registration
    case RegisterAction.REDIRECT_TO_COMPANY_REGISTER: {
      //no user no company, jump to regist company page and pass user data
      const user = {
        firstname,
        lastname,
        username,
        password,
        email,
        avatarUrl,
        locale,
        verifyCode,
      };
      setTempUserData(user);

      return res.status(302).json({
        message: 'Company not found, redirect to company registration.',
        redirect: `${ROUTES.REGISTER_COMPANY}`,
      });
    }

    // create new user
    case RegisterAction.CREATE_USER: {
      // no user but have company
      return res.status(201).json({
        success: true,
        data: { refreshToken },
      });
    }

    // Unknow error
    default:
      return res.status(400);
  }
};
