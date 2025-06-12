import UserModel from '../../models/user';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import MembershipModel from '../../models/membership';
import { RoleType } from '../../config';
import { Types } from 'mongoose';
import { Company } from '../../models/company';
import logger from '../../utils/logger';

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
      logger.info('User not exist.');
      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.');
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
      logger.info('Password not match.');
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }
    const memberships = await MembershipModel.find({ user: user._id }).populate<{
      company: Pick<Company, 'slug'> & { _id: Types.ObjectId };
    }>('company', 'slug');
    if (!memberships.length) {
      logger.info('Membership or company not exist.');
      throw new AppException(HttpStatusCode.InternalServerError, 'Invalid credentials.');
    }

    const matchedMembershipWithSlug = memberships.find(m => m.company.slug === slug);
    if (!matchedMembershipWithSlug) {
      logger.info('Slug not match with domain.');
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials.');
    }
    const role = matchedMembershipWithSlug.role;
    if (!allowedRoles.includes(role)) {
      logger.info('Role not match.');
      throw new AppException(HttpStatusCode.Forbidden, 'Invalid credentials.');
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
