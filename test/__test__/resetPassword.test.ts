/// <reference types="jest" />
import { describe, expect, it } from '@jest/globals';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import ResetCodeBuilder from '@test/__test__/builders/resetCodeBuilder';
import request from 'supertest';

import { getApplication } from '../setup/app';
import { getDefaultUser } from '../setup/jest-setup';

describe('Reset password', () => {
  it('should successfully reset the password when the user exists with valid code', async () => {
    const defaultUser = getDefaultUser();
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode('888888')
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const response = await request(getApplication()).post('/api/v1/auth/reset-password').send({
      email: defaultUser.email,
      newPassword: '55647Aabb@',
      verifyValue: '888888',
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

  it('should return true when the user not exists', async () => {
    const response = await request(getApplication()).post('/api/v1/auth/reset-password').send({
      email: 'test@notexist.com',
      newPassword: '55647Aabb@',
      verifyValue: '888888',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should throw 401 unauthorized error when verification code not exists', async () => {
    const defaultUser = getDefaultUser();
    await ResetCodeModel.deleteMany({ email: defaultUser.email });

    const response = await request(getApplication()).post('/api/v1/auth/reset-password').send({
      email: defaultUser.email,
      newPassword: '55647Aabb@',
      verifyValue: '888888',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Invalid or expired code. Please request a new one./);
    expect(response.body.field).toBe('verificationCode');
  });

  it('should throw 401 invalid error if verification code is invalid', async () => {
    const defaultUser = getDefaultUser();
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withCode('888888')
      .save();
    const response = await request(getApplication()).post('/api/v1/auth/reset-password').send({
      email: defaultUser.email,
      newPassword: '55647Aabb@',
      verifyValue: 'wrongCode',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Invalid or expired code/);
    expect(response.body.field).toBe('verificationCode');

    const code = await ResetCodeModel.findOne({ email: defaultUser.email });
    expect(code?.attempts).toBe(1);
  });

  it('should throw 429 too many requests error after 5 invalid attempts', async () => {
    const defaultUser = getDefaultUser();
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode('888888')
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withAttempts(4)
      .save();

    const response = await request(getApplication()).post('/api/v1/auth/reset-password').send({
      email: defaultUser.email,
      newPassword: '55647Aabb@',
      verifyValue: 'wrongCodeAgain',
    });

    expect(response.status).toBe(429);
    expect(response.body.message).toBe(
      'Too many incorrect attempts. Please request a new verification value.',
    );

    const code = await ResetCodeModel.findOne({ email: defaultUser.email });
    expect(code).toBeNull();
  });

  it('should throw 401 unauthorized error if reset code expired', async () => {
    const defaultUser = getDefaultUser();
    await new ResetCodeBuilder()
      .withEmail(defaultUser.email)
      .withCode('888888')
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withExpiry(-10)
      .save();

    const response = await request(getApplication()).post('/api/v1/auth/reset-password').send({
      email: defaultUser.email,
      newPassword: '55647Aabb@',
      verifyValue: '888888',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid or expired code. Please request a new one.');
    expect(response.body.field).toBe('verificationCode');
  });
});
