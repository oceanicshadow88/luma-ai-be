import Token from '../models/token';
import { Types } from 'mongoose';

interface TokenInput {
  userId: string;
  token: string;
  type: 'refresh' | 'access';
  expiresAt: Date;
}

export const tokenService = {
  createToken: async (data: TokenInput) => {
    const { userId, token, type, expiresAt } = data;
    
    return await Token.create({
      userId: new Types.ObjectId(userId),
      token,
      type,
      expiresAt
    });
  },

  getValidToken: async (token: string, type: 'refresh' | 'access') => {
    return await Token.findOne({
      token,
      type,
      expiresAt: { $gt: new Date() }
    });
  },

  invalidateToken: async (token: string) => {
    return await Token.findOneAndUpdate(
      { token },
      { expiresAt: new Date() },
      { new: true }
    );
  },

  cleanupExpiredTokens: async () => {
    return await Token.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  }
}; 