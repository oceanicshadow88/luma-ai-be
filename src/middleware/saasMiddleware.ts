import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import config from '../config';
import AppException from '../exceptions/appException';
import CompanyModel, { Company } from '../models/company';

export const saas = async (req: Request, res: Response, next: NextFunction) => {
  const isLocalEnv = config.env === 'local';
  if (isLocalEnv) {
    const defaultCompany = await CompanyModel.findOne({ slug: 'default-company' });
    if (!defaultCompany) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Cannot not find default company');
    }
    req.company = defaultCompany as Company;
    req.companyId = defaultCompany._id as string;
    return next();
  }

  const origin = req.headers.origin ?? `${req.protocol}://${req.hostname}`;

  const hostname = new URL(origin).hostname.toLowerCase();
  if (!hostname) {
    throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
      payload: `Invalid origin header or URL: ${hostname}`,
    });
  }
  // Restrict form: subdomain.lumaai.com, no multi-level
  const domainParts = hostname.split('.');
  const partsCount = domainParts.length;

  if (
    partsCount !== 3 || // e.g., subdomain.lumaai.com
    domainParts[1] !== 'lumaai' ||
    domainParts[2] !== 'com'
  ) {
    throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
      payload: `Invalid domain format: ${hostname}`,
    });
  }

  const slug = domainParts[0];
  if (!slug) {
    throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
      payload: `Missing subdomain in hostname: ${hostname}`,
    });
  }

  const existCompany = await CompanyModel.findOne({ slug }).lean();
  if (!existCompany) {
    throw new AppException(HttpStatusCode.NotFound, 'Page not found', {
      payload: `Company not found for slug: ${slug}`,
    });
  }

  req.company = existCompany as Company;
  req.companyId = existCompany._id as string;
  next();
};
