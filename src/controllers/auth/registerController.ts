// authentication, authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
import { checkVerificationCode } from '../../services/auth/registerService';
import AppException from '../../exceptions/appException';
import { extractSubdomain } from '../../lib/extractSubdomain';
import CompanyModel from '../../models/company';

export interface RegisterUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyCode: string;
  termsAccepted: boolean;
}

export const studentRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  try {
    // Get company slug from subdomain
    const companySlug = await extractSubdomain(req);

    // Find company by slug
    const company = await CompanyModel.findOne({ slug: companySlug });
    if (!company || !company._id) {
      return res.status(400).json({
        message: 'Organization not found',
      });
    }

    // Verify code existence
    if (!userInput.verifyCode) {
      return res.status(400).json({
        message: 'Verification code is required',
      });
    }

    // Verify the code
    await checkVerificationCode(userInput.verifyCode, userInput.email);

    // Create user and membership
    const { refreshToken, accessToken } = await registerService.studentRegister(
      userInput,
      company._id.toString(),
    );

    res.status(201).json({
      message: 'Successfully signed up!',
      refreshToken,
      accessToken,
    });
  } catch (error: unknown) {
    if (error instanceof AppException) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'An error occurred during registration',
    });
  }
};

export const adminRegister = async (req: Request, res: Response) => {
  // Validate Data - Joi validate schema: deal in route with authValidation middleware
  // Get params from request body
  const userInput = req.body as RegisterUserInput;

  // create user
  const { refreshToken, accessToken } = await registerService.userRegister(userInput);

  res.status(201).json({ refreshToken, accessToken });
};
