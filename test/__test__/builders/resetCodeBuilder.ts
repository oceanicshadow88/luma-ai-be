import ResetCodeModel, { ResetCode } from '@src/models/resetCode';
import { VerifyCodeType } from '@src/types/invitation';

export default class ResetCodeBuilder {
  private resetCode: Partial<ResetCode>;

  constructor() {
    this.resetCode = {
      email: 'test@example.com',
      code: '888888',
      verifyType: VerifyCodeType.VERIFICATION,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // default expired in 15 mins
      attempts: 0,
    };
  }

  withEmail(email: string): this {
    this.resetCode.email = email;
    return this;
  }

  withCode(code: string): this {
    this.resetCode.code = code;
    return this;
  }

  withVerifyType(type: VerifyCodeType): this {
    this.resetCode.verifyType = type;
    return this;
  }

  withExpiry(minutesFromNow: number): this {
    this.resetCode.expiresAt = new Date(Date.now() + minutesFromNow * 60 * 1000);
    return this;
  }

  withPastExpiry(): this {
    this.resetCode.expiresAt = new Date(Date.now() - 5 * 60 * 1000);
    return this;
  }

  withAttempts(attempts: number): this {
    this.resetCode.attempts = attempts;
    return this;
  }

  build(): ResetCode {
    return new ResetCodeModel(this.resetCode) as ResetCode;
  }

  async save(): Promise<ResetCode> {
    return await this.build().save();
  }
}
