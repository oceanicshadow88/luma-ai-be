import { Request, Response, NextFunction } from 'express';

import { HttpStatusCode } from 'axios';
import AppException from '../exceptions/appException';
import { extractCompanySlugFromEmail } from '../utils/extractCompanySlugFromEmail';
import { getCompanySlugFromSubdomain } from '../utils/getCompanySlugFromSubdomain';

export const resolveCompanySlug = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  let slug: string | null;

  const adminPaths = ['/auth/signup/admin'];
  const isAdminRoute = adminPaths.some(path => req.path.startsWith(path));
  if (isAdminRoute) {
    slug = await extractCompanySlugFromEmail(email);
  } else {
    slug = await getCompanySlugFromSubdomain(req);
  }
  if (!slug) {
    throw new AppException(HttpStatusCode.BadRequest, 'Cannot extract company from email');
  }
  req.companySlug = slug;
  next();
};
