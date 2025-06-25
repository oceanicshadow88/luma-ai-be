import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
// @ts-ignore
import freemail from 'freemail';
import { parse } from 'psl';

import AppException from '../exceptions/appException';
import { extractFrontendBaseUrl } from '../utils/invitationLink';

/**
 * Extract company slug from email domain
 * @param email - The email address to extract company slug from
 * @returns Company slug or null if extraction fails
 * @throws AppException if email is invalid or uses public email provider
 */
export const extractCompanySlug = async (email: string): Promise<string | null> => {
  const domain = email.split('@')[1]?.toLowerCase();
  // email required
  if (!domain) {
    throw new AppException(HttpStatusCode.BadRequest, 'Please provide a valid email address');
  }

  // block public email
  if (freemail.isFree(email)) {
    throw new AppException(HttpStatusCode.BadRequest, 'Public email providers are not allowed');
  }

  // Determine the structure of a domain name, identify top-level domains, subdomains, primary domains, etc
  const parsed = parse(domain);
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'domain' in parsed &&
    typeof parsed.domain === 'string'
  ) {
    const slug = parsed.domain.split('.')[0];
    if (slug) {
      return slug;
    }
  }

  throw new AppException(HttpStatusCode.BadRequest, 'Please provide a valid email address');
};

/**
 * Middleware to extract frontend base URL from request headers
 * Throws an exception if no valid frontend URL can be determined
 */
export const extractFrontendUrl = (req: Request, res: Response, next: NextFunction): void => {
  const frontendBaseUrl = extractFrontendBaseUrl(req);

  if (!frontendBaseUrl) {
    throw new AppException(
      HttpStatusCode.BadRequest,
      'Unable to determine frontend URL from request headers. Please ensure Origin, Referer, or Host header is present.',
    );
  }

  req.frontendBaseUrl = frontendBaseUrl;
  next();
};
