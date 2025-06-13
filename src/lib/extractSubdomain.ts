import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import { HttpStatusCode } from 'axios';
import { Request } from 'express';

export async function extractSubdomain(req: Request): Promise<string> {
  const hostname = req.hostname?.toLowerCase();
  if (!hostname) {
    throw new AppException(HttpStatusCode.BadRequest, 'Invalid hostname');
  }

  const firstDotIndex = hostname.indexOf('.');
  if (firstDotIndex === -1) {
    // e.g., "localhost", no subdomain
    const firstCompany = await CompanyModel.findOne().sort({ createdAt: 1 }).lean();
    if (!firstCompany || !firstCompany.slug) {
      throw new AppException(HttpStatusCode.NotFound, 'No default company slug found in database');
    }
    return firstCompany.slug;
  }

  const subdomain = hostname.substring(0, firstDotIndex);
  if (!subdomain) {
    throw new AppException(HttpStatusCode.BadRequest, 'Invalid subdomain');
  }

  return subdomain;
}
