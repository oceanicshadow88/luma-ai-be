/// <reference types="jest" />
import { beforeEach, describe, expect, it } from '@jest/globals';
import config from '@src/config';
import ResetCodeModel from '@src/models/resetCode';
import { VerifyCodeType } from '@src/types/invitation';
import ResetCodeBuilder from '@test/__test__/builders/resetCodeBuilder';
import { getApplication } from '@test/setup/app';
import { Application } from 'express';
import request from 'supertest';

describe('Verification code sent', () => {
  const apiPath = '/api/v1/auth/request-verification-code';
  const testEmail = 'test@example.com';
  const verifyValue = '888888';
  let app: Application;

  beforeEach(async () => {
    app = getApplication();
  });

  it('should request a verification code successfully', async () => {
    await ResetCodeModel.deleteMany({ email: testEmail });

    const res = await request(app).post(apiPath).send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const codeRecord = await ResetCodeModel.findOne({
      email: testEmail,
      verifyType: VerifyCodeType.VERIFICATION,
    });

    expect(codeRecord).not.toBeNull();
  });

  it('should block repeated requests within rate limit time', async () => {
    await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withCode(verifyValue)
      .save();

    const response = await request(app).post(apiPath).send({ email: testEmail });

    expect(response.status).toBe(429);
    expect(response.body.message).toContain('Too many requests. Please try again later.');
  });

  it('should allow new request after rate limit cool down', async () => {
    const codeRecord = await new ResetCodeBuilder()
      .withEmail(testEmail)
      .withCode(verifyValue)
      .withVerifyType(VerifyCodeType.VERIFICATION)
      .withExpiry(config.resetCodeExpiry)
      .save();

    await ResetCodeModel.updateOne(
      { _id: codeRecord._id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );

    const res = await request(app).post(apiPath).send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
