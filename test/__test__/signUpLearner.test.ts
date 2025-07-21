/// <reference types="jest" />

import { describe, expect, it } from '@jest/globals';
import MembershipModel from '@src/models/membership';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { VerifyCodeType } from '@src/types/invitation';
import ResetCodeBuilder from '@test/__test__/builders/resetCodeBuilder';
import UserBuilder from '@test/__test__/builders/userBuilder';
import { getApplication } from '@test/setup/app';
import { getDefaultCompany, getDefaultUser } from '@test/setup/jest-setup';
import request from 'supertest';

describe('Sign Up Learner', () => {
  const apiPath = '/api/v1/auth/signup/learner';
  const originURL = 'http://default-company.lumaai.com';
  const testEmail = 'learner@default-company.com';
  const testUsername = 'test';
  const testFirstname = 'learner';
  const testLastname = 'user';
  const testPassword = '123@Password';
  const verifyValue = '888888';

  it('should register a learner successfully', async () => {
    const defaultCompany = getDefaultCompany();

    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const learnerUser = new UserBuilder()
      .withEmail(testEmail)
      .withUsername(testUsername)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue,
        companyId: defaultCompany._id,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully signed up!');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('accessToken');

    const verifyValueInDB = await ResetCodeModel.findOne({ email: testEmail });
    expect(verifyValueInDB).toBeNull();

    const user = await UserModel.findOne({ email: testEmail });
    expect(user).not.toBeNull();
    expect(user?.username).toBe(testUsername);

    const membership = await MembershipModel.findOne({
      user: user?._id,
      company: defaultCompany?._id?.toString(),
    });
    expect(membership).not.toBeNull();
  });

  it('should return 409 conflict error if email already registered', async () => {
    const defaultCompany = getDefaultCompany();

    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const defaultUser = getDefaultUser();

    const learnerUser = new UserBuilder()
      .withEmail(defaultUser.email)
      .withUsername(testUsername)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue,
        companyId: defaultCompany._id,
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Email already registered. Please log in.');
  });

  it('should return 409 conflict error if username already registered', async () => {
    const defaultCompany = getDefaultCompany();

    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const defaultUser = getDefaultUser();

    const learnerUser = new UserBuilder()
      .withEmail(testEmail)
      .withUsername(defaultUser.username)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue,
        companyId: defaultCompany._id,
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Username already in use. Try a different one.');
  });

  it('should throw 401 unauthorized error when verification code not exists', async () => {
    const defaultCompany = getDefaultCompany();
    await ResetCodeModel.deleteMany({ email: testEmail });

    const learnerUser = new UserBuilder()
      .withEmail(testEmail)
      .withUsername(testUsername)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue,
        companyId: defaultCompany._id,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid or expired code. Please request a new one.');
    expect(response.body.field).toBe('verificationCode');
  });

  it('should return 401 if verification code is invalid', async () => {
    const defaultCompany = getDefaultCompany();

    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .save();

    const learnerUser = new UserBuilder()
      .withEmail(testEmail)
      .withUsername(testUsername)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue: 'wrongCode',
        companyId: defaultCompany._id,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid or expired code. Please request a new one.');
    expect(response.body.field).toBe('verificationCode');
  });

  it('should throw 429 too many requests error after 5 invalid attempts', async () => {
    const defaultCompany = getDefaultCompany();

    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withAttempts(4)
      .save();

    const learnerUser = new UserBuilder()
      .withEmail(testEmail)
      .withUsername(testUsername)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue: 'wrongCodeAgain',
        companyId: defaultCompany._id,
      });

    expect(response.statusCode).toBe(429);
    expect(response.body.message).toBe(
      'Too many incorrect attempts. Please request a new verification value.',
    );
    expect(response.body.field).toBe('verificationCode');

    const code = await ResetCodeModel.findOne({ email: testEmail });
    expect(code).toBeNull();
  });

  it('should throw 401 unauthorized error if reset code expired', async () => {
    const defaultCompany = getDefaultCompany();

    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withExpiry(-10)
      .save();

    const learnerUser = new UserBuilder()
      .withEmail(testEmail)
      .withUsername(testUsername)
      .withFirstName(testFirstname)
      .withLastName(testLastname)
      .withPassword(testPassword)
      .build();

    const response = await request(getApplication())
      .post(apiPath)
      .set('origin', originURL)
      .send({
        ...learnerUser,
        termsAccepted: true,
        verifyValue,
        companyId: defaultCompany._id,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid or expired code. Please request a new one.');
    expect(response.body.field).toBe('verificationCode');
  });
});
