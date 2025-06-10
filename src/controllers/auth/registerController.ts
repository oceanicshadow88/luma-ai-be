// Authentication and authorization
import { Request, Response } from 'express';
import { registerService } from '../../services/auth/registerService';
import { LocaleType } from 'src/config';
import { checkVerificationCode } from '../../services/auth/registerService';
import AppException from '../../exceptions/appException';
import { extractSubdomain } from '../../lib/extractSubdomain';
import CompanyModel from '../../models/company';
import { HttpStatusCode } from 'axios';

export interface RegisterUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  verifyCode?: string;
}

export const learnerRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  try {
    // Get company slug from subdomain
    const companySlug = await extractSubdomain(req);

    // Verify code existence
    if (!userInput.verifyCode) {
      return res.status(400).json({
        message: 'Verification code is required',
      });
    }

    // Verify the code
    await checkVerificationCode(userInput.verifyCode, userInput.email);

    // Find company by slug
    const company = await CompanyModel.findOne({ slug: companySlug });
    if (!company || !company._id) {
      throw new AppException(HttpStatusCode.BadRequest, 'Company not exist');
    }

    // Create user and membership
    const { refreshToken, accessToken } = await registerService.learnerRegister(
      userInput,
      company._id.toString(),
    );

    res.status(201).json({
      message: 'Successfully signed up!',
      refreshToken,
      accessToken,
    });
  } catch (error) {
    if (error instanceof AppException) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

export const adminRegister = async (req: Request, res: Response) => {
  const userInput = req.body as RegisterUserInput;

  try {
    const { refreshToken, accessToken } = await registerService.adminRegister(userInput);
    res.status(201).json({
      message: 'Successfully signed up!',
      refreshToken,
      accessToken,
    });
  } catch (error) {
    if (error instanceof AppException) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};
