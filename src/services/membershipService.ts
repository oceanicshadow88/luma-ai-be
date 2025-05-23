import { Types, Document } from 'mongoose';
import { RoleType } from '../config';
import MembershipModel, { Membership } from '../models/membership';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';

interface MembershipInput {
  companyId: string;
  userId: string;
  role: RoleType;
  status?: boolean;
}

export const membershipService = {
  // check membership exist, return boolean
  checkMembershipExist: async (userId: string, companyId: string, role: string): Promise<boolean> => {
    const exists = await MembershipModel.exists({
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
      role,
    });
    // Forcefully convert any value to a boolean value
    return !!exists;
  },


  // create membership if not exist, return membership
  createMembership: async (membershipInput: MembershipInput) => {
    // if membership exist, throw error
    const membershipExists = await membershipService.checkMembershipExist(
      membershipInput.userId,
      membershipInput.companyId,
      membershipInput.role
    );
    if (membershipExists) {
      throw new AppException(HttpStatusCode.Conflict, 'Membership already exists for this user, company, and role');
    }
    // no membership, create
    return MembershipModel.create(membershipInput);
  },

  // find memebership
  getMemebershipOne: async (userId: string, companyId: string, role: string
  ): Promise<Membership | null> => {
    return MembershipModel.findOne({
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
      role,
    });
  },

  getUserRoles: async (userId: string, companyId: string): Promise<string[]> => {
    const roles = await MembershipModel.find({
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(userId),
    }).select('role');

    return roles.map((r) => r.role);
  },

};
