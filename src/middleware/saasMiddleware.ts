import { Request, Response, NextFunction } from 'express';
import Company from '../models/company';
import config from '../config';

export const saas = async (req: Request, res: Response, next: NextFunction) => {
  const isLocalEnv = config.env === 'local';
  if (isLocalEnv) {
    const existCompany = await Company.findOne({ slug: 'default-company' });
    if (!existCompany) {
      throw new Error('Cannot not find default company');
    }
    req.company = existCompany as any;
    req.companyId = existCompany._id as string;
    next();
    return;
  }

  const host = req.headers.origin;
  const result = await Company.findOne({ origin: { $regex: host } });
  if (!result) {
    throw new Error('Cannot find company');
  }
  req.company = result as any;
  req.companyId = result._id as string;
  next();
  return;
};
