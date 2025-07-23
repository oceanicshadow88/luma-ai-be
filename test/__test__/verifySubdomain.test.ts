/// <reference types="jest" />

import { describe, expect, it } from '@jest/globals';
import CompanyModel from '@src/models/company';
import CompanyBuilder from '@test/__test__/builders/companyBuilder';
import { getApplication } from '@test/setup/app';
import request from 'supertest';

describe('Verify subdomain company exist', () => {
  const apiURL = '/api/v1/auth/verify-subdomain';
  const originURL = 'http://default-company.lumaai.com';

  it('should return 200 OK and verify subdomain for local env', async () => {
    process.env.NODE_ENV = 'local';

    const response = await request(getApplication()).get(apiURL).set('origin', originURL);

    expect(response.status).toBe(200);
  });

  it('should return 200 for exist company subdomain with production env', async () => {
    await new CompanyBuilder().withSlug('exist-company').save();
    process.env.NODE_ENV = 'production';

    const response = await request(getApplication())
      .get(apiURL)
      .set('origin', 'http://exist-company.lumaai.com');

    expect(response.status).toBe(200);
  });

  it('should return 404 if company not found for subdomain', async () => {
    await CompanyModel.deleteMany({});
    process.env.NODE_ENV = 'production';

    const response = await request(getApplication()).get(apiURL).set('origin', originURL);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });

  it('should return 404 if subdomain is missing', async () => {
    process.env.NODE_ENV = 'production';

    const response = await request(getApplication()).get(apiURL).set('origin', 'http://com');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });

  it('should return 404 if invalid subdomain', async () => {
    process.env.NODE_ENV = 'production';

    const response = await request(getApplication()).get(apiURL).set('origin', 'http://.com');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Page not found');
  });
});
