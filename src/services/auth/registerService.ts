import ResetCodeModel from '../../models/resetCode';
import ConflictsException from '../../exceptions/conflictsException';
import UnauthorizedException from '../../exceptions/unauthorizedException';
import company from '../../models/company';
import UserModel from '../../models/user';
import { membershipService } from '../membershipService';
import { generateTokenByUser } from '../../utils/token';

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
    // check exist user
    const existUserbyUsername = await UserModel.findOne({ username });
    if (existUserbyUsername) {
      throw new ConflictsException(`${username} already exists`);
    }
    const existUserbyEmail = await UserModel.findOne({ email });
    if (existUserbyEmail) {
      throw new ConflictsException(`${email} already exists`);
    }
    const existCompany = await company.findOne({ slug: companySlug });
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

    // Create membership
    const membership = await membershipService.createMembership({
      companyId: existCompany.id,
      userId: user.id,
      role: 'admin',
      status: 'active',
    });
    await membership.save();

    const result: {
      refreshToken: string;
      accessToken: string;
    } = { refreshToken, accessToken };

    return result;
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    const user = await UserModel.findOne({ email });
    return !!user;
  },
};
