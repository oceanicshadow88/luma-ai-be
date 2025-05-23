// @ts-ignore
import freemail from 'freemail';
import { parse } from 'psl';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';

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
