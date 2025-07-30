import { RoleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import { Company } from '@src/models/company';
import MembershipModel from '@src/models/membership';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import logger from '@src/utils/logger';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

export const passwordResetService = async ({
  email,
  verifyValue,
  newPassword,
  slug,
  allowedRoles,
}: {
  email: string;
  verifyValue: string;
  newPassword: string;
  slug: string;
  allowedRoles: RoleType[];
}): Promise<void> => {
  const user = await UserModel.findOne({ email });
  // User not exist still return true
  if (!user) {
    logger.error(`Reset password: user not exist with email: ${email}`);
    return;
  }

  const memberships = await MembershipModel.find({ user: user._id }).populate<{
    company: Pick<Company, 'slug'> & { _id: Types.ObjectId };
  }>('company', 'slug');
  if (!memberships.length) {
    throw new AppException(HttpStatusCode.InternalServerError, 'Membership or company not exist.');
  }

  const matchedMembershipWithSlug = memberships.find(m => m.company.slug === slug);
  if (!matchedMembershipWithSlug) {
    // User not exist in this company still return true
    logger.error(`Reset password: Company slug not match with subdomain: ${slug}.`);
    return;
  }

  const role = matchedMembershipWithSlug.role;
  if (!allowedRoles.includes(role)) {
    logger.error(`User role: ${role} not match with ${allowedRoles}`);
    return;
  }

  // Find the reset code for this email
  const resetCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  }).exec();
  // Check if reset code exists
  if (!resetCode) {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      'Invalid or expired verification value. Please request a new one.',
      {
        field: 'verificationCode',
        payload: `ResetCode not exist with email ${email} for ${VerifyCodeType.VERIFICATION}`,
      },
    );
  }

  await resetCode.validateResetCode(verifyValue);

  user.password = newPassword;
  await resetCode.deleteOne();
  user.refreshToken = undefined;
  await user.save();
};
