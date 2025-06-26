import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import config from '../config';
import AppException from '../exceptions/appException';
import { extractSubdomain } from '../lib/extractSubdomain';
import CompanyModel, { Company } from '../models/company';

export const saas = async (req: Request, res: Response, next: NextFunction) => {
  const isLocalEnv = config.env === 'local';
  if (isLocalEnv) {
    const defaultCompany = await CompanyModel.findOne({ slug: 'default-company' });
    if (!defaultCompany) {
      throw new Error('Cannot not find default company');
    }
    req.company = defaultCompany as Company;
    req.companyId = defaultCompany._id as string;
    next();
    return;
  }

  const slug = await extractSubdomain(req);
  const existCompany = await CompanyModel.findOne({ slug }).lean();
  if (!existCompany) {
    throw new AppException(HttpStatusCode.NotFound, `Company not found for slug: ${slug}`);
  }

  req.company = existCompany as Company;
  req.companyId = existCompany._id as string;
  next();
};
