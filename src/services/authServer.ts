import ConflictsException from '../exceptions/conflictsException';
import UnauthorizedException from '../exceptions/unauthorizedException';
import { jwtUtils } from '../lib/jwtUtils';
import company from '../models/company';
import UserModel from '../models/user';
import { Types } from 'mongoose';
import { membershipService } from './membershipService';

export const authService = {
  registerUser: async ({
    firstname,
    lastname,
    username,
    password,
    email,
    avatarUrl,
    locale,
    companySlug,
    verificationRequired = false,
  }: {
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    email: string;
    avatarUrl?: string;
    locale?: string;
    companySlug: string;
    verificationRequired?: boolean;
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
    const userId = (user._id as Types.ObjectId).toString();
    const accessToken = jwtUtils.generateAccessToken({ userId });
    const refreshToken = jwtUtils.generateRefreshToken({ userId });

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
    console.log(membership);

    const result: {
      refreshToken: string;
      accessToken: string;
      verificationCode?: string;
      verificationExpiry?: Date;
    } = { refreshToken, accessToken };

    // Only add verification details to result if verification is required
    if (verificationRequired && user.resetCode && user.resetCodeExpiry) {
      result.verificationCode = user.resetCode;
      result.verificationExpiry = user.resetCodeExpiry;
    }

    return result;
  },

  loginUser: async ({ email, password }: { email: string; password: string }) => {
    // find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // verify password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // generate token
    const userId = (user._id as Types.ObjectId).toString();
    const accessToken = jwtUtils.generateAccessToken({ userId });
    const refreshToken = jwtUtils.generateRefreshToken({ userId });

    // save refreshToken
    user.refreshToken = refreshToken;
    await user.save();

    return { refreshToken, accessToken };
  },

  refreshAuthToken: async (refreshToken: string) => {
    const payload = jwtUtils.verifyRefreshToken(refreshToken);

    const user = await UserModel.findOne({ _id: payload.userId, refreshToken });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = jwtUtils.generateAccessToken({
      userId: (user._id as Types.ObjectId).toString(),
    });
    const newRefreshToken = jwtUtils.generateRefreshToken({
      userId: (user._id as Types.ObjectId).toString(),
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  logoutUser: async (refreshToken: string) => {
    const user = await UserModel.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  },
};
