/// <reference types="jest" />

import { afterAll, beforeAll, beforeEach } from '@jest/globals';
import { ROLE } from '@src/config';
import { Membership } from '@src/models/membership';
import MembershipBuilder from '@test/__test__/builders/membershipBuilder';
import { HttpStatusCode } from 'axios';

import AppException from '../../src/exceptions/appException';
import CompanyBuilder, { type CompanyDocument } from '../__test__/builders/companyBuilder';
import UserBuilder, { type UserDocument } from '../__test__/builders/userBuilder';
import * as app from './app';
import * as db from './db';

let defaultUser: UserDocument | null = null;
let defaultCompany: CompanyDocument | null = null;
let defaultMembership: Membership | null = null;

const createDefaultData = async (): Promise<void> => {
  // Create a default company with owner for tests
  defaultUser = await new UserBuilder()
    .withEmail('owner@lumaai.com')
    .withUsername('defaultowner')
    .withFirstName('Default')
    .withLastName('Owner')
    .withPassword('123@Password')
    .save();

  defaultCompany = await new CompanyBuilder()
    .withCompanyName('testCompany')
    .withPlan('free')
    .withSlug('default-company')
    .withOwner(defaultUser._id)
    .save();

  defaultMembership = await new MembershipBuilder()
    .withCompany(defaultCompany._id)
    .withUser(defaultUser._id)
    .withRole(ROLE.ADMIN)
    .save();
};

beforeAll(async () => {
  await db.connect();
  await db.clearDatabase();
  await app.loadApp();
});

beforeEach(async () => {
  // Clear database before each test
  await db.clearDatabase();
  // Reset the database before each test
  await createDefaultData();
});

afterAll(async () => {
  // Close the database connection after all tests are done
  await db.closeDatabase();
  await app.closeApp();
});

// Export read-only getters
export const getDefaultUser = (): UserDocument => {
  if (!defaultUser) {
    throw new AppException(HttpStatusCode.InternalServerError, 'Default user creation failed!');
  }
  return defaultUser;
};

export const getDefaultCompany = (): CompanyDocument => {
  if (!defaultCompany) {
    throw new AppException(HttpStatusCode.InternalServerError, 'Default company creation failed!');
  }
  return defaultCompany;
};

export const getDefaultMembership = (): Membership => {
  if (!defaultMembership) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      'Default membership creation failed!',
    );
  }
  return defaultMembership;
};
