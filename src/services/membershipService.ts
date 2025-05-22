import { Types, Document } from 'mongoose';

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
  createMembership: async (data: MembershipInput) => { },
};
