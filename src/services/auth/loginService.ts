import { RoleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import { Company } from '@src/models/company';
import MembershipModel from '@src/models/membership';
import UserModel from '@src/models/user';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';
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
        HttpStatusCode.NotFound,
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

    const memberships = await MembershipModel.find({ user: user._id }).populate<{
      company: Pick<Company, 'slug'> & { _id: Types.ObjectId };
    }>('company', 'slug');
    if (!memberships.length) {
      throw new AppException(
        HttpStatusCode.InternalServerError,
        'Membership or company not exist.',
      );
    }
    const matchedMembershipWithSlug = memberships.find(m => m.company.slug === slug);
    if (!matchedMembershipWithSlug) {
      throw new AppException(
        HttpStatusCode.InternalServerError,
        ` Company slug not match with subdomain: ${slug}.`,
      );
    }
    const role = matchedMembershipWithSlug.role;
    if (!allowedRoles.includes(role)) {
      throw new AppException(
        HttpStatusCode.InternalServerError,
        `User role: ${role} not match with ${allowedRoles}`,
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
      companySlug: matchedMembershipWithSlug.company.slug,
      role: matchedMembershipWithSlug.role,
    };
  },
};
