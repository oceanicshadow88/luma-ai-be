import Invite from '../models/invite';
import { Types } from 'mongoose';
import crypto from 'crypto';

interface InviteInput {
  companyId: string;
  email: string;
  role: string;
}

export const inviteService = {
  createInvite: async (data: InviteInput) => {
    const { companyId, email, role } = data;
    
    const existing = await Invite.findOne({ 
      companyId, 
      email,
      expiresAt: { $gt: new Date() },
      acceptedAt: null
    });
    
    if (existing) {
      throw new Error('Active invitation already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    return await Invite.create({
      companyId: new Types.ObjectId(companyId),
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  },

  getInviteByToken: async (token: string) => {
    return await Invite.findOne({ 
      token,
      expiresAt: { $gt: new Date() },
      acceptedAt: null
    });
  },

  acceptInvite: async (token: string) => {
    const invite = await Invite.findOneAndUpdate(
      { 
        token,
        expiresAt: { $gt: new Date() },
        acceptedAt: null
      },
      { acceptedAt: new Date() },
      { new: true }
    );

    if (!invite) {
      throw new Error('Invalid or expired invitation');
    }

    return invite;
  },

  getActiveInvites: async (companyId: string) => {
    return await Invite.find({
      companyId,
      expiresAt: { $gt: new Date() },
      acceptedAt: null
    });
  }
}; 