// authentication, authorization
import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth/registerService';
import { extractCompanySlug } from '../../middleware/extractCompanySlugFromEmail';
import { companyService } from '../../services/companyService';

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
    res.status(201).json({
      data: { refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const exists = await authService.checkEmailExists(email);

    if (exists) {
      return res.json({
        success: true,
        emailExists: true,
        message: 'Email already exists, please login',
      });
    }

    const result = await companyService.checkEmailAndSendCode(email);

    return res.json({
      emailExists: false,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error checking email',
    });
  }
};

export const checkCompanySlug = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.body;

    const exists = await companyService.checkCompanySlugExists(companyName);

    return res.json({
      success: true,
      hasCompanyName: exists,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error checking company name',
    });
  }
};

export const createCompanyAndAccount = async (req: Request, res: Response) => {
  try {
    const { email, companyName, password, firstName, lastName } = req.body;

    const result = await companyService.createCompanyAndAccount({
      email,
      companyName,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error creating company and account',
    });
  }
};
