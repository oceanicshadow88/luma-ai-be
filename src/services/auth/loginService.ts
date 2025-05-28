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
  adminLogin: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginResult> => {
    // check user exist
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.');
    }
    // verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppException(HttpStatusCode.Unauthorized, 'Invalid credentials');
    }
    // check membership
    const memberships = await MembershipModel.find({ user: user._id });
    if (!memberships.length) {
      // no membership
      throw new AppException(HttpStatusCode.NotFound, 'Invalid credentials.');
    }
    const adminMembership = memberships.find(m => m.role === ROLE.ADMIN); // find role = admin
    if (adminMembership) {
      // have admin
      if (memberships.length > 1) {
        throw new AppException(
          HttpStatusCode.BadRequest,
          'Admin should not belong to multiple companies',
        );
      }
    }

    // gerate token
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
