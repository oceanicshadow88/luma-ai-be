import { RoleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import UserModel from '@src/models/user';
import { HttpStatusCode } from 'axios';
export interface LoginResult {
  refreshToken?: string;
  accessToken?: string;
  companySlug: string;
  role: RoleType;
}

export const loginService = {
  login: async ({
    email,
    password,
    slug,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allowedRoles,
  }: {
    email: string;
    password: string;
    slug: string;
    allowedRoles: RoleType[];
  }): Promise<LoginResult> => {
    const user = await UserModel.findOne({ email });
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

    //find by Company

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
    };
  },
};
