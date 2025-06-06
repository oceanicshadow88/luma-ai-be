import UserModel from '../../models/user';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import MembershipModel from '../../models/membership';
import { ROLE, RoleType } from '../../config';
import { Types } from 'mongoose';

export interface LoginResult {
  refreshToken?: string;
  accessToken?: string;
  membership?: {
    company: Types.ObjectId;
    role: RoleType;
  }[];
}

export const loginService = {
  login: async ({ email, password }: { email: string; password: string }): Promise<LoginResult> => {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }

    const memberships = await MembershipModel.find({ user: user._id });
    if (!memberships.length) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Invalid credentials.');
    }
    const adminMembership = memberships.find(m => m.role === ROLE.ADMIN);
    if (adminMembership) {
      if (memberships.length > 1) {
        throw new AppException(HttpStatusCode.InternalServerError, 'Invalid credentials.');
      }
    }

    const { refreshToken, accessToken } = await user.generateTokens();
    user.refreshToken = refreshToken;
    await user.save();

    return {
      refreshToken,
      accessToken,
      membership: memberships.map(m => ({
        company: m.company,
        role: m.role,
      })),
    };
  },
};
