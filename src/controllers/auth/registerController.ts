// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../middleware/extractCompanySlugFromEmail';

export const register = async (req: Request, res: Response, next: NextFunction) => {
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
    // check emial exist user

    // get company slug
    const companySlug = extractCompanySlug(email);

    const { refreshToken } = await authService.adminRegister({
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

    // request
    res.status(201).json({ success: true, data: { refreshToken } });
  } catch (error) {
    next(error);
  }
};
