import { Types } from 'mongoose';
import MembershipModel, { Membership } from '../models/membership';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { User } from '../models/user';
import CompanyModel from '../models/company';
import { extractCompanySlugbyAdminEmail } from '../utils/extractCompanySlugFromAdminEmail';
import { MembershipStatusType, RoleType } from '../config';

export interface MembershipInput {
  company: Types.ObjectId;
  user: Types.ObjectId;
  role: RoleType;
  status?: MembershipStatusType;
}

export const membershipService = {
  // check membership exist, return boolean
  checkMembershipExist: async (
    user: Types.ObjectId,
    company: Types.ObjectId,
    role: RoleType,
  ): Promise<boolean> => {
    const exists = await MembershipModel.exists({ user, company, role });
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

  createAdminMembershipByUser: async (user: User, role: RoleType): Promise<Membership> => {
    const slug = await extractCompanySlugbyAdminEmail(user.email);
    if (!slug) {
      throw new AppException(HttpStatusCode.BadRequest, 'Cannot extract company from email');
    }
    // eslint-disable-next-line local/no-dev-notes
    //TODO: this is a bug
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

  countRolesInCompany: async (companyId: string, role: RoleType) => {
    return MembershipModel.countDocuments({
      company: companyId,
      role,
    });
  },
};
