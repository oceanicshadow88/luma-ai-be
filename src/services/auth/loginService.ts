import UserModel from '../../models/user';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import MembershipModel from '../../models/membership';
import { RoleType } from '../../config';
import { Types } from 'mongoose';
import { Company } from '../../models/company';

export interface LoginResult {
  refreshToken?: string;
  accessToken?: string;
  companySlug: string;
  role: RoleType;
}

export const loginService = {
  // login: async ({ email, password }: { email: string; password: string }): Promise<LoginResult> => {
  //   const user = await UserModel.findOne({ email });
  //   if (!user) {
  //     throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.');
  //   }

  //   const isValidPassword = await user.validatePassword(password);
  //   if (!isValidPassword) {
  //     throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
  //   }

  //   const memberships = await MembershipModel.find({ user: user._id });
  //   if (!memberships.length) {
  //     throw new AppException(HttpStatusCode.InternalServerError, 'Invalid credentials.');
  //   }
  //   const adminMembership = memberships.find(m => m.role === ROLE.ADMIN);
  //   if (adminMembership) {
  //     if (memberships.length > 1) {
  //       throw new AppException(HttpStatusCode.InternalServerError, 'Invalid credentials.');
  //     }
  //   }

  //   const { refreshToken, accessToken } = await user.generateTokens();
  //   user.refreshToken = refreshToken;
  //   await user.save();

  //   return {
  //     refreshToken,
  //     accessToken,
  //     membership: memberships.map(m => ({
  //       company: m.company,
  //       role: m.role,
  //     })),
  //   };
  // },

  //
  userlogin: async ({
    email,
    password,
    slug,
  }: {
    email: string;
    password: string;
    slug: string;
  }): Promise<LoginResult> => {
    const user = await UserModel.findOne({ email });
    if (!user) {
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
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }
    const memberships = await MembershipModel.find({ user: user._id }).populate<{
      company: Pick<Company, 'slug'> & { _id: Types.ObjectId };
    }>('company', 'slug');
    if (!memberships.length) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Invalid credentials.');
    }
    const matchedMembership = memberships.find(m => m.company.slug === slug);
    if (!matchedMembership) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid company access.');
    }

    const { refreshToken, accessToken } = await user.generateTokens();
    user.refreshToken = refreshToken;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return {
      accessToken,
      refreshToken,
      companySlug: matchedMembership.company.slug,
      role: matchedMembership.role,
    };
  },
};
