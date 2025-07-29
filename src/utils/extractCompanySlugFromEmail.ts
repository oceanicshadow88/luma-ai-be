// @ts-ignore
import AppException from '@src/exceptions/appException';
import { HttpStatusCode } from 'axios';
import { parse } from 'psl';

export const extractCompanySlug = async (email: string): Promise<string> => {
  const domain = email.split('@')[1]?.toLowerCase();
  // email required
  if (!domain) {
    throw new AppException(
      HttpStatusCode.UnprocessableEntity,
      'Please provide a valid email address',
    );
  }
  // block public email
  // if (freemail.isFree(email)) {
  //   throw new AppException(
  //     HttpStatusCode.UnprocessableEntity,
  //     'Public email providers are not allowed',
  //     {
  //       field: 'email',
  //     },
  //   );
  // }
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

  throw new AppException(
    HttpStatusCode.UnprocessableEntity,
    'Please provide a valid email address',
  );
};
