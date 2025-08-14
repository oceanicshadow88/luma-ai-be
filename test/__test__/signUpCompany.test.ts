import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ROLES } from '@src/config/constants';
import CompanyModel, { Company } from '@src/models/company';
import UserModel, { User, USER_STATUS } from '@src/models/user';
import { companyService } from '@src/services/companyService';
import UserBuilder from '@test/__test__/builders/userBuilder';
import { getApplication } from '@test/setup/app';
import { getDefaultCompany, getDefaultUser } from '@test/setup/jest-setup';
import { Application, NextFunction, Request, Response } from 'express';
import request from 'supertest';

describe('Sign Up Company and Owner', () => {
  const apiPath = '/api/v1/auth/signup/institution';
  const companyName = 'newCompany';
  const slug = 'new-slug';

  let app: Application;
  let owner: User;

  beforeEach(async () => {
    app = getApplication();
    owner = await new UserBuilder()
      .withEmail('newOwner@gmail.com')
      .withUsername('newOwner')
      .withFirstName('new')
      .withLastName('Owner')
      .withPassword('123@Password')
      .withRole(ROLES.ADMIN)
      .withStatus(USER_STATUS.ACTIVE)
      .save();
  });

  it('should create a company and update owner successfully ', async () => {
    const { accessToken } = await owner.generateTokens();

    const response = await request(app)
      .post(apiPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyName,
        slug,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully signed up!');
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    const companyInDb = await CompanyModel.findOne({ companyName, slug }).lean();
    expect(companyInDb).toBeTruthy();
    expect(companyInDb?.companyName).toBe(companyName);
    expect(companyInDb?.slug).toBe(slug);

    const ownerInDb = await UserModel.findById(owner._id).lean();
    expect(ownerInDb).toBeTruthy();
    expect(ownerInDb?.company?.toString()).toBe(companyInDb?._id.toString());
  });

  it('should return 401 unauthorized error if missing owner accessToken', async () => {
    const response = await request(app).post(apiPath).set('Authorization', `Bearer ${''}`).send({
      companyName,
      slug,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized Access');
  });

  it('should return 403 unauthorized error if owner not exist', async () => {
    const { accessToken } = await owner.generateTokens();
    await UserModel.deleteMany({ email: owner.email });

    const response = await request(app)
      .post(apiPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyName,
        slug,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Unauthorized Access');
  });

  it('should return 409 if slug conflict', async () => {
    const { accessToken } = await owner.generateTokens();
    const defaultCompany = getDefaultCompany();

    const response = await request(app)
      .post(apiPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyName,
        slug: defaultCompany.slug,
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Slug already in use. Try a different one.');
  });

  it('should return 409 if companyName conflict', async () => {
    const { accessToken } = await owner.generateTokens();
    const defaultCompany = getDefaultCompany();

    const response = await request(app)
      .post(apiPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyName: defaultCompany.companyName,
        slug,
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Company already exists');
  });

  it('should return 500 if owner already has company', async () => {
    const defaultUser = getDefaultUser();
    const { accessToken } = await defaultUser.generateTokens();

    const response = await request(app)
      .post(apiPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyName,
        slug,
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
  });

  it('should return 500 if company creation failed (no _id returned)', async () => {
    const { accessToken } = await owner.generateTokens();

    // mock createCompany return no _id company model
    jest.spyOn(companyService, 'createCompany').mockResolvedValueOnce({
      companyName,
      slug,
    } as Partial<Company> as Company);

    const response = await request(app)
      .post(apiPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyName,
        slug,
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
  });

  it('should return 500 if req.user.email missing', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('@src/middleware/authGuard', () => ({
        authGuard: (req: Request, res: Response, next: NextFunction) => {
          req.user = {
            id: '',
            email: undefined as unknown as string,
            username: 'test-user',
            status: USER_STATUS.ACTIVE,
            role: ROLES.ADMIN,
          };
          next();
        },
      }));

      const { loadApp, getApplication } = await import('@test/setup/app');
      await loadApp();
      const app = getApplication();

      const response = await request(app).post(apiPath).send({
        companyName,
        slug,
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });
  });
});
