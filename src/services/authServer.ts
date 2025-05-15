import ResetCodeModel from '../models/resetCode';
import ConflictsException from '../exceptions/conflictsException';
import UnauthorizedException from '../exceptions/unauthorizedException';
import { jwtUtils } from '../lib/jwtUtils';
import UserModel from '../models/user';
import { Types } from 'mongoose';

export const authService = {
  registerUser: async ({
    firstname,
    lastname,
    username,
    password,
    email,
    avatarUrl,
    verifyCode,
    locale,
  }: {
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    email: string;
    avatarUrl?: string;
    locale?: string;
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

    if (!verifyCode) {
      throw new UnauthorizedException('Verification code is required');
    }

    // check verifyCode
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
    const userId = (user._id as Types.ObjectId).toString();
    const accessToken = jwtUtils.generateAccessToken({ userId });
    const refreshToken = jwtUtils.generateRefreshToken({ userId });

    // save refreshToken
    user.refreshToken = refreshToken;
    await user.save();
    const result: {
      refreshToken: string;
      accessToken: string;
    } = { refreshToken, accessToken };

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
