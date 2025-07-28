/// <reference types="jest" />

import { beforeEach, describe, expect, it } from '@jest/globals';
import CompanyModel from '@src/models/company';
import CompanyBuilder from '@test/__test__/builders/companyBuilder';
import { getApplication } from '@test/setup/app';
import { Application } from 'express';
import request from 'supertest';

describe('Verify domain and company exist by slug', () => {
  const apiURL = '/api/v1/auth/verify-domain';
  const originURL = 'http://default-company.lumaai.com';
  let app: Application;

  beforeEach(async () => {
    app = getApplication();
  });

  it('should return 200 for valid domain and existing company ', async () => {
    const response = await request(app).get(apiURL).set('origin', originURL);

    expect(response.status).toBe(200);
  });

  it('should return 200 for domain end with localhost ', async () => {
    const response = await request(app)
      .get(apiURL)
      .set('origin', 'http://default-company.lumaai.localhost:8000');

    expect(response.status).toBe(200);
  });

  it('should return 404 if company slug does not exist', async () => {
    await CompanyModel.deleteMany({});

    const response = await request(app).get(apiURL).set('origin', originURL);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });

  it('should return 404 if subdomain is missing (e.g. http://lumaai.com)', async () => {
    await new CompanyBuilder().withSlug('lumaai').save();

    const response = await request(app).get(apiURL).set('origin', 'http://lumaai.com');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });

  it('should return 404 if invalid domain (e.g. http://.com)', async () => {
    const response = await request(app).get(apiURL).set('origin', 'http://.com');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });

  it('should return 404 for multi-level subdomain (e.g. http://a.b.lumaai.com)', async () => {
    const response = await request(app).get(apiURL).set('origin', 'http://a.b.lumaai.com');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });

  it('should return 404 for disallowed domain (e.g. http://abc.fake.com)', async () => {
    await new CompanyBuilder().withSlug('abc').save();
    const response = await request(app).get(apiURL).set('origin', 'http://abc.fake.com');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });
});
