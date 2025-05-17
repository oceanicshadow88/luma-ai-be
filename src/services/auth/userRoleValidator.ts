import UserModel from '../../models/user';
import CompanyModel from '../../models/company';
import { extractCompanySlug } from 'src/middleware/extractCompanySlugFromEmail';
import MembershipModel, { Membership } from '../../models/membership';
import { ROLE } from '../../config';
import membershipService from '../membershipService';
import membership from '../../models/membership';

export type RoleValidationResult = // return type
  | { success: true; membership: Membership }
  | { success: false; reason: 'USER_NOT_FOUND' | 'COMPANY_NOT_FOUND' | 'MEMBERSHIP_NOT_FOUND' };

export const userValidateRole = async (
  email: string,
  role: string
): Promise<RoleValidationResult> => {
  const user = await UserModel.findOne({ email });
  if (!user) return { success: false, reason: 'USER_NOT_FOUND' };

  if (role === ROLE.ADMIN) {
    const companySlug = extractCompanySlug(email);
    if (!companySlug) return { success: false, reason: 'COMPANY_NOT_FOUND' };

    const company = await CompanyModel.findOne({ slug: companySlug });
    if (!company) return { success: false, reason: 'COMPANY_NOT_FOUND' };

    const membership = await MembershipModel.findOne({
      userId: user.id,
      companyId: company.id,
      role,
    });

    if (!membership) {
      // Create membership
      const membership = await membershipService.createMembership({
        companyId: company.id,
        userId: user.id,
        role: ROLE.ADMIN,
        status: 'active',
      });
      await membership.save();
    }

    return { success: true, membership };
  }

  return { success: false, reason: membership };
};
