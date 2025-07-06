import { MembershipStatusType, RoleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import MembershipModel, { Membership } from '@src/models/membership';
import { User } from '@src/models/user';
import { extractCompanySlug } from '@src/utils/extractCompanySlugFromEmail';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

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
        HttpStatusCode.InternalServerError,
        'Membership already exists for this user, company, and role',
      );
    }
    return await MembershipModel.create(membershipInput);
  },

  createAdminMembershipByUser: async (user: User, role: RoleType): Promise<Membership> => {
    const slug = await extractCompanySlug(user.email);

    const existCompany = await CompanyModel.findOne({ slug });
    if (!existCompany) {
      throw new AppException(
        HttpStatusCode.InternalServerError,
        `Company not exist with slug: ${slug}`,
      );
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
