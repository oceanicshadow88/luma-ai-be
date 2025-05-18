// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { registerService } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../middleware/extractCompanySlugFromEmail';
import { jwtUtils } from '../../lib/jwtUtils';

export const adminRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      case 'redirectToCompanyRegister': {
        //no user no coompany
        const userData: string = jwtUtils.generateTempDataToken({
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
          redirect: `/v1/companies?userData=${userData}`,
        });
      }

      case 'createUser': {
        // no user but have company
        return res.status(201).json({
          success: true,
          data: { refreshToken },
        });
      }

      default:
        return res.status(400).json({ message: 'Register unknown action' });
    }
  } catch (error) {
    next(error);
  }
};
