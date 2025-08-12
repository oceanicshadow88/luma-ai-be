import AppException from '@src/exceptions/appException';
import UserModel, { USER_STATUS } from '@src/models/user';
import { RoleType } from '@src/types/constants';
import { HttpStatusCode } from 'axios';
export interface LoginResult {
  refreshToken?: string;
  accessToken?: string;
  companySlug: string;
  role: RoleType;
  companyId?: string;
}

export const loginService = {
  login: async ({
    email,
    password,
    slug,
    companyId,
  }: {
    email: string;
    password: string;
    slug: string;
    companyId: string;
  }): Promise<LoginResult> => {
    const user = await UserModel.findOne({
      email,
      company: companyId,
      status: USER_STATUS.ACTIVE,
    });
    if (!user) {
      throw new AppException(
        HttpStatusCode.Unauthorized,
        'Login failed. Please check your email and password',
        { payload: `User not found with email: ${email}` },
      );
    }
    if (user.isLocked()) {
      throw new AppException(
        HttpStatusCode.TooManyRequests,
        'Too many failed login attempts. Please try again later..',
      );
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new AppException(
        HttpStatusCode.Unauthorized,
        'Login failed. Please check your email and password',
        { payload: `Password: ${password} not match.` },
      );
    }

    const { refreshToken, accessToken } = await user.generateTokens();
    user.refreshToken = refreshToken;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return {
      accessToken,
      refreshToken,
      companySlug: slug,
      role: user.role,
      companyId: user.company?.toString(),
    };
  },
};
