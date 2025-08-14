import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import logger from '@src/utils/logger';
import { HttpStatusCode } from 'axios';

export async function passwordResetService(
  companyId: string,
  email: string,
  verifyValue: string,
  newPassword: string,
) {
  const user = await UserModel.findOne({ email, company: companyId }).exec();

  if (!user) {
    logger.error(`Reset password: user not exist with email: ${email}`);
    return;
  }

  const resetCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  }).exec();

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
}
