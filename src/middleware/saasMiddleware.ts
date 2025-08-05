import { authService } from '@src/services/auth/authService';
import { companyService } from '@src/services/companyService';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import AppException from '../exceptions/appException';
import { Company } from '../models/company';

export const saas = async (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? `${req.protocol}://${req.hostname}`;
  const allowedMainDomains = ['lumaai.com', 'lumaai.localhost'];
  if (allowedMainDomains.includes(req.hostname)) {
    next();
    return;
  }
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
