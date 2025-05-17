import ResetCodeModel from '../../models/resetCode';
import ConflictsException from '../../exceptions/conflictsException';
import UnauthorizedException from '../../exceptions/unauthorizedException';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';
import { membershipService } from '../membershipService';
import { generateTokenByUser } from '../../utils/token';
import { RoleValidationResult, userValidateRole } from './userRoleValidator';
import { ROLE } from '../../config';

export const authService = {
  // get adminUserInput
  adminRegister: async ({
    firstname,
    lastname,
    username,
    password,
    email,
    avatarUrl,
    verifyCode,
    locale,
    companySlug,
  }: {
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    email: string;
    avatarUrl?: string;
    locale?: string;
    companySlug: string;
    verifyCode?: string;
  }) => {
    // check jump to login
    const validateResult = await userValidateRole(email, ROLE.ADMIN);
    if (validateResult.success) {
      throw new UnauthorizedException('User already registed. Redirect to login.', { payload: { redirectTo: '/v1/auth/login' } });
    }

    switch (validateResult.reason) {
      case 'COMPANY_NOT_FOUND':
        throw new UnauthorizedException('Company not found. Redirect to company register .', { payload: { redirectTo: '/v1/companies/auth/signup' } });
      case 'USER_NOT_FOUND':
      case 'MEMBERSHIP_NOT_FOUND':
    }

    // check exist user
    const existUserbyUsername = await UserModel.findOne({ username });
    if (existUserbyUsername) {
      throw new ConflictsException(`${username} already exists`);
    }
    const existUserbyEmail = await UserModel.findOne({ email });
    if (existUserbyEmail) {
      throw new ConflictsException(`${email} already exists`);
    }
    const existCompany = await CompanyModel.findOne({ slug: companySlug });
    if (!existCompany) {
      throw new UnauthorizedException('Company not found');
    }

    // check verifyCode
    if (!verifyCode) {
      throw new UnauthorizedException('Verification code is required');
    }
    if (verifyCode) {
      const resetCode = await ResetCodeModel.findOne({
        email,
      });
      if (!resetCode) {
        throw new UnauthorizedException('Invalid verification code');
      }
      const { isValid, message } = await resetCode.validateResetCode(verifyCode);
      if (!isValid) {
        throw new UnauthorizedException(message);
      }
    }

    // create new user
    const user = new UserModel({
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      locale,
    });
    await user.hashPassword();

    // generate Token
    const { refreshToken, accessToken } = await generateTokenByUser(user);

    // save refreshToken
    user.refreshToken = refreshToken;
    await user.save();



    const result: {
      refreshToken: string;
      accessToken: string;
    } = { refreshToken, accessToken };

    return result;
  },
};

export const checkAdminWithEmail = async (email: string) => {
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new ConflictsException(`User with email ${email} already exists`);
  }
}; 
