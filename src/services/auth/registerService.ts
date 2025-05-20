import ResetCodeModel from '../../models/resetCode';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';
import { generateTokenByUser } from '../../utils/token';
import { userService } from '../userService';
import { membershipService } from '../membershipService';
import { ROLE } from '../../config';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';

// Action enum
export enum RegisterAction {
  CREATE_USER = 'createUser',
  REDIRECT_TO_COMPANY_REGISTER = 'redirectToCompanyRegister',
  ERROR = 'error',
}

export const registerService = {
  // get adminUserInput
  userRegister: async ({
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
    // check username
    await checkUseWithUsername(username);
    // check company exist
    const companyCheck = await checkCompanyWithSlug(companySlug);
    if ('data' in companyCheck) {
      const company = companyCheck.data!;

      // verify code to regist
      if (verifyCode) {
        await checkVerificationCode(verifyCode, email);
      }

      // create new user
      const user = await userService.createUser({
        firstname,
        lastname,
        username,
        password,
        email,
        avatarUrl,
        locale,
      });
      // generate Token
      const { refreshToken } = await generateTokenByUser(user);
      user.refreshToken = refreshToken;
      await user.save();

      // create membership
      const membership = await membershipService.createMembership({
        companyId: company.id.toString(),
        userId: user.id.toString(),
        role: ROLE.ADMIN,
        status: 'active',
      });
      await membership.save();

      return {
        action: RegisterAction.CREATE_USER,
        refreshToken: refreshToken,
      };
    }
    if ('action' in companyCheck) {
      return { action: companyCheck.action };
    }

    return { action: RegisterAction.ERROR };
  },
};

// check exist user with username
export const checkUseWithUsername = async (username: string) => {
  const existUser = await UserModel.findOne({ username });
  if (existUser) {
    // if exist user
    throw new AppException(HttpStatusCode.Conflict, `${username} already exists`);
  }
};

// check company exist with company slug
export const checkCompanyWithSlug = async (companySlug: string) => {
  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // no company
    return { action: RegisterAction.REDIRECT_TO_COMPANY_REGISTER };
  }
  // exist company
  return { data: existCompany };
};

// verify code
export const checkVerificationCode = async (verifyCode: string, email: string) => {
  if (!verifyCode) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Verification code is required');
  }

  const resetCode = await ResetCodeModel.findOne({ email });
  if (!resetCode) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid verification code');
  }

  const { isValid, message } = await resetCode.validateResetCode(verifyCode);
  if (!isValid) {
    throw new AppException(HttpStatusCode.Unauthorized, message);
  }
};
