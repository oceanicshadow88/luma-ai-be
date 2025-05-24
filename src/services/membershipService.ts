import { Types } from 'mongoose';
import MembershipModel, { Membership } from '../models/membership';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { User } from '../models/user';
import CompanyModel from '../models/company';
import { extractCompanySlug } from '../utils/extractCompanySlugFromEmail';

interface MembershipInput {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  status?: boolean;
}

export const membershipService = {
  // check membership exist, return boolean
  checkMembershipExist: async (
    userId: Types.ObjectId,
    companyId: Types.ObjectId,
    role: string,
  ): Promise<boolean> => {
    const exists = await MembershipModel.exists({ userId, companyId, role });
    // Forcefully convert any value to a boolean value
    return !!exists;
  },

  // create membership if not exist, return membership
  createMembership: async (membershipInput: MembershipInput): Promise<Membership> => {
    const membershipExists = await membershipService.checkMembershipExist(
      membershipInput.userId,
      membershipInput.companyId,
      membershipInput.role,
    );
    if (membershipExists) {
      throw new AppException(
        HttpStatusCode.Conflict,
        'Membership already exists for this user, company, and role',
      );
    }
    return await MembershipModel.create(membershipInput);
  },

  createMembershipByUser: async (user: User, role: string): Promise<Membership> => {
    const slug = await extractCompanySlug(user.email);
    const existCompany = await CompanyModel.findOne({ slug });
    if (!existCompany) {
      throw new AppException(HttpStatusCode.BadRequest, 'Company not exist');
    }
    return membershipService.createMembership({
      userId: user._id as Types.ObjectId,
      companyId: existCompany._id as Types.ObjectId,
      role,
    });
  },

  // find membership
  getMembershipOne: async (
    userId: Types.ObjectId,
    companyId: Types.ObjectId,
    role: string,
  ): Promise<Membership | null> => {
    return MembershipModel.findOne({ userId, companyId, role });
  },

  getUserRoles: async (userId: Types.ObjectId, companyId: Types.ObjectId): Promise<string[]> => {
    const roles = await MembershipModel.find({ userId, companyId }).select('role');
    return roles.map(r => r.role);
  },
};
