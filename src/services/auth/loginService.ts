import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

import { RoleType } from '../../config';
import AppException from '../../exceptions/appException';
import { Company } from '../../models/company';
import MembershipModel from '../../models/membership';
import UserModel from '../../models/user';
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
      throw new AppException(HttpStatusCode.NotFound, 'User not exist.');
    }
    if (user.isLocked()) {
      throw new AppException(
        HttpStatusCode.TooManyRequests,
        'Too many failed login attempts. Please try again later.',
      );
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new AppException(HttpStatusCode.Unauthorized, 'Password not match.');
    }
    const memberships = await MembershipModel.find({ user: user._id }).populate<{
      company: Pick<Company, 'slug'> & { _id: Types.ObjectId };
    }>('company', 'slug');
    if (!memberships.length) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Membership or company not exist.');
    }
    const matchedMembershipWithSlug = memberships.find(m => m.company.slug === slug);
    if (!matchedMembershipWithSlug) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Slug not match with domain.');
    }
    const role = matchedMembershipWithSlug.role;
    if (!allowedRoles.includes(role)) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Role not match..');
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
