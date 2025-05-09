import Membership from '../models/membership';
import { Types } from 'mongoose';

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
};
