/// <reference types="jest" />
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Company } from '@src/models/company';
import ResetCodeModel from '@src/models/resetCode';
import UserModel, { User } from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import CompanyBuilder from '@test/__test__/builders/companyBuilder';
import ResetCodeBuilder from '@test/__test__/builders/resetCodeBuilder';
import { Application } from 'express';
import request from 'supertest';

import { getApplication } from '../setup/app';
import { getDefaultCompany, getDefaultUser } from '../setup/jest-setup';

describe('Reset password', () => {
  const apiPath = '/api/v1/auth/reset-password';
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
  });

  it('should successfully reset the password with exist user in right company', async () => {
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const response = await request(app).post(apiPath).set('origin', originURL).send({
      email: defaultUser.email,
      newPassword: newPassword,
      verifyValue: verifyValue,
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Password has been reset successfully');

    //The assertion verification value has been deleted
    const verifyValueInDB = await ResetCodeModel.findOne({ email: defaultUser.email });
    expect(verifyValueInDB).toBeNull();

    //Claiming that user refreshToken has been cleared
    const user = await UserModel.findOne({ email: defaultUser.email }).exec();
    expect(user?.refreshToken).toBeUndefined();
  });

  it('should return success when the user not exists', async () => {
    const user = await UserModel.findOne({ email: 'test@notexist.com' }).exec();
    expect(user).toBeNull();

    const response = await request(app).post(apiPath).set('origin', originURL).send({
      email: 'test@notexist.com',
      newPassword: newPassword,
      verifyValue: verifyValue,
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Password has been reset successfully');
  });

  it('should return success when user does not belong to the company', async () => {
    const wrongCompany = await new CompanyBuilder()
      .withCompanyName('wrong company')
      .withSlug('wrong-company')
      .save();

    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const response = await request(app)
      .post(apiPath)
      .set('origin', 'http://wrong-company.lumaai.com')
      .send({
        email: defaultUser.email,
        newPassword: newPassword,
        verifyValue: verifyValue,
        companyId: wrongCompany._id,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Password has been reset successfully');
  });

  it('should throw 401 unauthorized error when verification code not exists', async () => {
    await ResetCodeModel.deleteMany({ email: defaultUser.email });

    const response = await request(app).post(apiPath).set('origin', originURL).send({
      email: defaultUser.email,
      newPassword: newPassword,
      verifyValue: verifyValue,
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      /Invalid or expired verification value. Please request a new one./,
    );
    expect(response.body.field).toBe('verificationCode');
  });

  it('should throw 401 invalid error if verification code is invalid', async () => {
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withCode(verifyValue)
      .save();

    const response = await request(app).post(apiPath).set('origin', originURL).send({
      email: defaultUser.email,
      newPassword: newPassword,
      verifyValue: 'wrongCode',
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Invalid or expired verification value. Please request a new one.',
    );
    expect(response.body.field).toBe('verificationCode');

    const code = await ResetCodeModel.findOne({ email: defaultUser.email });
    expect(code?.attempts).toBe(1);
  });

  it('should throw 429 too many requests error after 5 invalid attempts', async () => {
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withAttempts(4)
      .save();

    const response = await request(app).post(apiPath).set('origin', originURL).send({
      email: defaultUser.email,
      newPassword: newPassword,
      verifyValue: 'wrongCodeAgain',
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(429);
    expect(response.body.message).toBe(
      'Too many incorrect attempts. Please request a new verification value.',
    );

    const code = await ResetCodeModel.findOne({ email: defaultUser.email });
    expect(code).toBeNull();
  });

  it('should throw 401 unauthorized error if reset code expired', async () => {
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withExpiry(-10)
      .save();

    const response = await request(app).post(apiPath).set('origin', originURL).send({
      email: defaultUser.email,
      newPassword: newPassword,
      verifyValue: verifyValue,
      companyId: defaultCompany._id,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Invalid or expired verification value. Please request a new one.',
    );
    expect(response.body.field).toBe('verificationCode');
  });
});
