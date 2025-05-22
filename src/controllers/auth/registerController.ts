// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { RegisterAction, registerService } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../middleware/extractCompanySlugFromEmail';
import { jwtUtils } from '../../lib/jwtUtils';

export const adminRegister = async (req: Request, res: Response, next: NextFunction) => {
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
  }: {
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    email: string;
    avatarUrl?: string;
    verifyCode?: string;
    locale?: string;
  } = req.body;

  // get company slug
  const companySlug = extractCompanySlug(email);

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
      const payloadToken: string = jwtUtils.generatePayloadToken({
        firstname,
        lastname,
        username,
        password,
        email,
        avatarUrl,
        locale,
        verifyCode,
      });

      return res.status(302).json({
        message: 'Company not found, redirect to company registration.',
        redirect: `/v1/companies?payloadToken=${payloadToken}`,
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
