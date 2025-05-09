import jwt from 'jsonwebtoken';
import { IUser } from '../models/user';
import config from '../config';

export const generateAccessToken = (user: IUser) => {
  return jwt.sign(
    { 
      _id: user._id,
      email: user.email,
      role: user.role,
      companyId: user.companyId 
    },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = (user: IUser) => {
  return jwt.sign(
    { _id: user._id },
    config.jwt.refreshSecret,
    { expiresIn: '7d' }
  );
}; 