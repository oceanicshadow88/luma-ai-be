import { Request, Response, NextFunction } from 'express';
import { extractCompanySlug } from '../utils/extractCompanySlugFromAdminEmail';
import { extractCompanySlugbySubdomain } from '../utils/extractCompanySlugbySubdomain';
import { HttpStatusCode } from 'axios';
import AppException from '../exceptions/appException';

export const resolveCompanySlug = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  let slug: string | null;

  const adminPaths = ['/auth/signup/admin'];
  const isAdminRoute = adminPaths.some(path => req.path.startsWith(path));
  if (isAdminRoute) {
    slug = await extractCompanySlug(email);
  } else {
    slug = await extractCompanySlugbySubdomain(req);
  }
  if (!slug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Cannot extract company from email');
  }
  req.companySlug = slug;
  next();
};
