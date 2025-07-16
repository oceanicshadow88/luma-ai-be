/// <reference types="jest" />

import CompanyBuilder, { type CompanyDocument } from '../__test__/builders/companyBuilder';
import UserBuilder, { type UserDocument } from '../__test__/builders/userBuilder';
import * as app from './app';
import * as db from './db';

// Jest globals
declare const beforeAll: (fn: () => Promise<void>) => void;
declare const beforeEach: (fn: () => Promise<void>) => void;
declare const afterAll: (fn: () => Promise<void>) => void;

let defaultUser: UserDocument | null = null;
let defaultCompany: CompanyDocument | null = null;

const createDefaultData = async (): Promise<void> => {
  // Create a default company with owner for tests
  defaultUser = await new UserBuilder()
    .withEmail('owner@lumaai.com')
    .withUsername('defaultowner')
    .withFirstName('Default')
    .withLastName('Owner')
    .save();

  defaultCompany = await new CompanyBuilder().withOwner(defaultUser._id).save();
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
export const getDefaultUser = (): UserDocument | null => defaultUser;
export const getDefaultCompany = (): CompanyDocument | null => defaultCompany;
