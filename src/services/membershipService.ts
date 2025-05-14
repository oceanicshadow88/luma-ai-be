import Membership from '../models/membership';
import { Types, Document } from 'mongoose';
import User from '../models/user';
import { redisClient } from '../utils/redis';

interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
}

interface MembershipInput {
  companyId: string;
  userId: string;
  role: 'admin' | 'instructor' | 'student';
  status?: 'invited' | 'active' | 'disabled';
}

export const membershipService = {
  createMembership: async (data: MembershipInput) => {
    const { companyId, userId, role, status = 'active' } = data;

    const existing = await Membership.findOne({
      companyId,
      userId,
    });

    if (existing) {
      throw new Error('Membership already exists');
    }

    return await Membership.create({
      companyId: new Types.ObjectId(companyId),
      userId: new Types.ObjectId(userId),
      role,
      status,
    });
  },

  getMembershipsByCompany: async (companyId: string) => {
    return await Membership.find({
      companyId,
      status: 'active',
    }).populate('userId');
  },

  getMembershipsByUser: async (userId: string) => {
    return await Membership.find({
      userId,
      status: 'active',
    }).populate('companyId');
  },

  updateMembership: async (id: string, data: Partial<MembershipInput>) => {
    return await Membership.findByIdAndUpdate(id, data, { new: true });
  },

  deleteMembership: async (id: string) => {
    return await Membership.findByIdAndUpdate(id, { status: 'disabled' }, { new: true });
  },

  createInitialMembership: async (
    userId: string,
    companyId: string,
    role: 'admin' | 'instructor',
  ) => {
    return await Membership.create({
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
      role,
      status: 'active',
    });
  },

  checkExistingMembership: async (email: string, companyId: string) => {
    const user = (await User.findOne({ email })) as UserDocument;
    if (!user) return false;

    const membership = await Membership.findOne({
      userId: user._id.toString(),
      companyId,
      status: 'active',
    });

    return !!membership;
  },

  acceptInvite: async (token: string) => {
    const inviteData = await redisClient.get(`invite:${token}`);
    if (!inviteData) {
      throw new Error('Invalid or expired invite token');
    }

    const { companyId, email, role } = JSON.parse(inviteData);
    const user = (await User.findOne({ email })) as UserDocument;
    if (!user) {
      throw new Error('User not found');
    }

    const membership = await membershipService.createMembership({
      userId: user._id.toString(),
      companyId,
      role,
      status: 'active',
    });

    await redisClient.del(`invite:${token}`);
    return membership;
  },
};
