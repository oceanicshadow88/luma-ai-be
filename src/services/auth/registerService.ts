import ResetCodeModel from '../../models/resetCode';
import ConflictsException from '../../exceptions/conflictsException';
import UnauthorizedException from '../../exceptions/unauthorizedException';
import CompanyModel from '../../models/company';
import UserModel from '../../models/user';
import { generateTokenByUser } from '../../utils/token';
import { userService } from '../userService';
import { membershipService } from '../membershipService';
import { ROLE } from '../../config';

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
        action: 'createUser',
        refreshToken: refreshToken,
      };
    }
    if ('action' in companyCheck) {
      return { action: companyCheck.action };
    }

    return { action: 'error' };
  },
};

// check exist user with username
export const checkUseWithUsername = async (username: string) => {
  const existUser = await UserModel.findOne({ username });
  if (existUser) {
    // if exist user
    throw new ConflictsException(`${username} already exists`);
  }
};

// check company exist with company slug
export const checkCompanyWithSlug = async (companySlug: string) => {
  const existCompany = await CompanyModel.findOne({ slug: companySlug });
  if (!existCompany) {
    // no company
    return { action: 'redirectToCompanyRegister' };
  }
  // exist company
  return { data: existCompany };
};

// verify code
export const checkVerificationCode = async (verifyCode: string, email: string) => {
  if (!verifyCode) {
    throw new UnauthorizedException('Verification code is required');
  }

  const resetCode = await ResetCodeModel.findOne({ email });
  if (!resetCode) {
    throw new UnauthorizedException('Invalid verification code');
  }

  const { isValid, message } = await resetCode.validateResetCode(verifyCode);
  if (!isValid) {
    throw new UnauthorizedException(message);
  }
};
