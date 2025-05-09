import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user';
import config from '../config';

export const generateAccessToken = (user: IUser) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username,
    },
    config.jwt.secret as jwt.Secret,
    { expiresIn: '1h' },
  );
};

export const generateRefreshToken = (user: IUser) => {
  return jwt.sign({ _id: user._id }, config.jwt.refreshSecret as jwt.Secret, { expiresIn: '7d' });
};
