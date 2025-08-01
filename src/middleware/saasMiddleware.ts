import { authService } from '@src/services/auth/authService';
import { companyService } from '@src/services/companyService';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import config from '../config';
import AppException from '../exceptions/appException';
import CompanyModel, { Company } from '../models/company';

export const saas = async (req: Request, res: Response, next: NextFunction) => {
  const isLocalEnv = config.env === 'local';
  if (isLocalEnv) {
    const defaultCompany = await CompanyModel.findOne({ slug: 'kitman2' });
    if (!defaultCompany) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Cannot not find default company');
    }
    req.company = defaultCompany as Company;
    req.companyId = defaultCompany._id as string;
    next();
    return;
  }

  const origin = req.headers.origin ?? `${req.protocol}://${req.hostname}`;

  const hostname = new URL(origin).hostname.toLowerCase();
  if (!hostname) {
    throw new AppException(HttpStatusCode.InternalServerError, `Invalid hostname: ${hostname}`);
  }

  const slug = await authService.verifyDomainGetSlug(hostname);

  const existCompany = await companyService.getCompanyBySlug(slug);
  if (!existCompany) {
    throw new AppException(
      HttpStatusCode.InternalServerError,
      `Company not found for slug: ${slug}`,
    );
  }

  req.company = existCompany as Company;
  req.companyId = existCompany._id as string;
  next();
};
