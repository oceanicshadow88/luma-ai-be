import { parse } from 'psl';
import ValidationException from '../exceptions/validationException';

const blockedDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'msn.com',
  'live.com',
  'mail.com',
  'protonmail.com',
];

export function extractCompanySlug(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    throw new ValidationException('Please provide a valid email address');
  }

  if (blockedDomains.includes(domain)) {
    // reject public email
    throw new ValidationException('Public email not allowed');
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

  throw new ValidationException('Please provide a valid email address');
}
