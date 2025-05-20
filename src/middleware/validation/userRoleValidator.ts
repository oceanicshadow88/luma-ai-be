import UserModel from '../../models/user';
import CompanyModel from '../../models/company';
import { extractCompanySlug } from '../extractCompanySlugFromEmail';
import MembershipModel from '../../models/membership';
import { ROLE } from '../../config';
import { membershipService } from '../../services/membershipService';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';

type RoleValidationReason = 'USER_NOT_FOUND' | 'COMPANY_NOT_FOUND' | 'LOGIN' | 'Unknown';

export interface RoleValidationResult {
  success: boolean;
  reason: RoleValidationReason;
}

export const userValidateRole = async (
  email: string,
  role: string,
): Promise<RoleValidationResult> => {
  // check user
  const user = await UserModel.findOne({ email });
  // if user not exist

  if (!user) {
    return { success: false, reason: 'USER_NOT_FOUND' };
  }

  // if role = admin
  if (role === ROLE.ADMIN) {
    // check company
    const companySlug = extractCompanySlug(email);
    if (!companySlug) {
      throw new AppException(HttpStatusCode.BadRequest, 'Please provide work email');
    }
    const company = await CompanyModel.findOne({ slug: companySlug });
    if (!company) return { success: false, reason: 'COMPANY_NOT_FOUND' };

    // check membership
    const membership = await MembershipModel.findOne({
      userId: user.id,
      companyId: company.id,
      role,
    });

    if (!membership) {
      // no membership, but have user and company
      // Create membership
      const membership = await membershipService.createMembership({
        companyId: company.id,
        userId: user.id,
        role: ROLE.ADMIN,
        status: 'active',
      });
      await membership.save();
    }
    // if have all 3 models
    return { success: true, reason: 'LOGIN' };
  }

  return { success: false, reason: 'Unknown' };
};
