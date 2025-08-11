/// <reference types="jest" />
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Company } from '@src/models/company';
import ResetCodeModel from '@src/models/resetCode';
import UserModel, { User } from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import ResetCodeBuilder from '@test/__test__/builders/resetCodeBuilder';
import { Application } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

import { getApplication } from '../setup/app';
import { getDefaultCompany, getDefaultUser } from '../setup/jest-setup';

describe('Reset password', () => {
  const apiPathEnterprise = '/api/v1/auth/reset-password';
  const originURL = 'http://default-company.lumaai.com';
  const newPassword = '55647Aabb@';
  const verifyValue = '888888';
  let app: Application;
  let defaultCompany: Company;
  let defaultUser: User;

  beforeEach(async () => {
    app = getApplication();
    defaultCompany = getDefaultCompany();
    defaultUser = getDefaultUser();

    defaultUser.company = defaultCompany._id as mongoose.Types.ObjectId;
    await defaultUser.save();
  });

  it('should successfully reset the password with exist user in right company', async () => {
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const response = await request(app).post(apiPathEnterprise).set('origin', originURL).send({
      email: defaultUser.email,
      newPassword: newPassword,
      verifyValue: verifyValue,
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password has been reset successfully');

    //The assertion verification value has been deleted
    const verifyValueInDB = await ResetCodeModel.findOne({ email: defaultUser.email });
    expect(verifyValueInDB).toBeNull();

    //Claiming that user refreshToken has been cleared
    const user = await UserModel.findOne({ email: defaultUser.email }).exec();
    expect(user?.refreshToken).toBeUndefined();
  });
});
