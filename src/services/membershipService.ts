import { Types } from 'mongoose';
import MembershipModel, { Membership } from '../models/membership';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { User } from '../models/user';
import CompanyModel from '../models/company';
import { extractCompanySlug } from '../utils/extractCompanySlugFromEmail';

interface MembershipInput {
  company: Types.ObjectId;
  user: Types.ObjectId;
  role: string;
  status?: boolean;
}

export const membershipService = {
  // check membership exist, return boolean
  checkMembershipExist: async (
    user: Types.ObjectId,
    company: Types.ObjectId,
    role: string,
  ): Promise<boolean> => {
    const exists = await MembershipModel.exists({ user: user, company: company, role });
    // Forcefully convert any value to a boolean value
    return !!exists;
  },

  // create membership if not exist, return membership
  createMembership: async (membershipInput: MembershipInput): Promise<Membership> => {
    const membershipExists = await membershipService.checkMembershipExist(
      membershipInput.user,
      membershipInput.company,
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
      user: user._id as Types.ObjectId,
      company: existCompany._id as Types.ObjectId,
      role,
    });
  },
};
