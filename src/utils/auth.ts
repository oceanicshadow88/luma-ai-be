import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import config from '../config';

export const generateAccessToken = (user: User) => {
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

export const generateRefreshToken = (user: User) => {
  return jwt.sign({ _id: user._id }, config.jwt.refreshSecret as jwt.Secret, { expiresIn: '7d' });
};
