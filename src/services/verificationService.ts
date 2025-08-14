import config from '@src/config';
import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import { VerifyCodeType } from '@src/types/invitation';
import { HttpStatusCode } from 'axios';

export const requestVerificationCodeService = async (email: string): Promise<void> => {
  const existingCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  }).exec();

  const now = new Date();

  if (existingCode) {
    const codeCreationTime = new Date(
      existingCode.expiresAt.getTime() - config.resetCodeExpiry * 1000,
    );
    const timeSinceCreation = now.getTime() - codeCreationTime.getTime();

    if (timeSinceCreation < config.resetCodeRateLimitExpiry * 1000) {
      const secondsRemaining = Math.ceil(
        (config.resetCodeRateLimitExpiry * 1000 - timeSinceCreation) / 1000,
      );

      throw new AppException(
        HttpStatusCode.TooManyRequests,
        `Too many requests. Please try again later. coolDownSeconds: ${secondsRemaining}`,
      );
    }
  }

  const verificationCode = '888888';

  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 15);

  if (existingCode) {
    await existingCode.deleteOne();
  }

  await ResetCodeModel.create({
    email,
    code: verificationCode,
    verifyType: VerifyCodeType.VERIFICATION,
    expiresAt: expiryTime,
    attempts: 0,
  });

  // Skip sending email for now - this will be implemented later
  // await sendVerificationCodeEmail(email, verificationCode);
};
