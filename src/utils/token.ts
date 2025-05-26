import { jwtUtils } from '../lib/jwtUtils';
import { Types } from 'mongoose';
import UserModel, { User } from '../models/user';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';

export const generateTokenByUser = async (user: User) => {
  // generate Token
  const userId = (user._id as Types.ObjectId).toString();
  const accessToken = jwtUtils.generateAccessToken({ user: userId });
  const refreshToken = jwtUtils.generateRefreshToken({ user: userId });

  return { accessToken, refreshToken };
};

export const refreshAuthToken = async (refreshToken: string) => {
  const payload = jwtUtils.verifyRefreshToken(refreshToken);

  const user = await UserModel.findOne({ _id: payload.user, refreshToken });
  if (!user) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid refresh token');
  }

  const newAccessToken = jwtUtils.generateAccessToken({
    user: (user._id as Types.ObjectId).toString(),
  });
  const newRefreshToken = jwtUtils.generateRefreshToken({
    user: (user._id as Types.ObjectId).toString(),
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
