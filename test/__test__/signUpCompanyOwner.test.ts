import { beforeEach, describe, expect, it } from '@jest/globals';
import { RegisterUserInput } from '@src/controllers/auth/registerController';
import { getPendingUserData, setPendingUserData } from '@src/utils/storagePendingUser';
import { getApplication } from '@test/setup/app';
import { getDefaultUser } from '@test/setup/jest-setup';
import { Application } from 'express';
import request from 'supertest';

describe('Sign Up Company and Owner', () => {
  const apiPath = '/api/v1/auth/signup/institution-owner';
  const testEmail = 'owner@nonexist-company.com';
  const verifyValue = '888888';
  const companyName = 'testCompany';

  let app: Application;

  beforeEach(() => {
    app = getApplication();
  });

  it('should create a company and owner user successfully ', async () => {
    const pendingUser: RegisterUserInput = {
      firstName: 'Test',
      lastName: 'User',
      username: 'Owner',
      password: '123@Password',
      email: testEmail,
      verifyValue,
    };
    setPendingUserData(pendingUser);
    expect(getPendingUserData()).toEqual(pendingUser);

    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      user: {
        username: 'Owner',
        email: testEmail,
      },
      company: {
        companyName: companyName,
        slug: 'nonexist-company',
      },
      membership: {
        role: 'admin',
      },
    });

    expect(getPendingUserData()).toBeNull();
  });

  it('should return 400 if missing owner registration data', async () => {
    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Missing user registration data, please return Admin Signup Page.',
    );
  });

  it('should return 422 for email without "@" symbol', async () => {
    const pendingUser: RegisterUserInput = {
      firstName: 'Test',
      lastName: 'User',
      username: 'Owner',
      password: '123@Password',
      email: 'ownernonexist-company.com',
      verifyValue,
    };

    setPendingUserData(pendingUser);
    expect(getPendingUserData()).toEqual(pendingUser);

    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Please provide a valid email address');
  });

  it('should return 422 if public email not work email', async () => {
    const pendingUser: RegisterUserInput = {
      firstName: 'Test',
      lastName: 'User',
      username: 'Owner',
      password: '123@Password',
      email: 'owner@gmail.com',
      verifyValue,
    };

    setPendingUserData(pendingUser);
    expect(getPendingUserData()).toEqual(pendingUser);

    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Public email providers are not allowed');
    expect(response.body.field).toBe('email');
  });

  it('should return 422 for email without "." symbol', async () => {
    const pendingUser: RegisterUserInput = {
      firstName: 'Test',
      lastName: 'User',
      username: 'Owner',
      password: '123@Password',
      email: 'owner@nonexist-companycom',
      verifyValue,
    };

    setPendingUserData(pendingUser);
    expect(getPendingUserData()).toEqual(pendingUser);

    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Please provide a valid email address');
  });

  it('should return 409 if email conflict', async () => {
    const defaultUser = getDefaultUser();
    const pendingUser: RegisterUserInput = {
      firstName: 'Test',
      lastName: 'User',
      username: 'Owner',
      password: '123@Password',
      email: defaultUser.email,
      verifyValue,
    };

    setPendingUserData(pendingUser);
    expect(getPendingUserData()).toEqual(pendingUser);

    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Email already registered. Please log in.');
    expect(response.body.field).toBe('email');
  });

  it('should return 409 if username conflict', async () => {
    const defaultUser = getDefaultUser();
    const pendingUser: RegisterUserInput = {
      firstName: 'Test',
      lastName: 'User',
      username: defaultUser.username,
      password: '123@Password',
      email: testEmail,
      verifyValue,
    };

    setPendingUserData(pendingUser);
    expect(getPendingUserData()).toEqual(pendingUser);

    const response = await request(app).post(apiPath).send({
      companyName,
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Username already in use. Try a different one.');
    expect(response.body.field).toBe('username');
  });
});
