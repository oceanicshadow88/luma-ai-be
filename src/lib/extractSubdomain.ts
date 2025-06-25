import { HttpStatusCode } from 'axios';
import { Request } from 'express';

import AppException from '../exceptions/appException';

export async function extractSubdomain(req: Request): Promise<string> {
  const origin = req.headers.origin ?? `${req.protocol}://${req.hostname}`;

  const hostname = new URL(origin).hostname.toLowerCase();
  if (!hostname) {
    throw new AppException(HttpStatusCode.BadRequest, 'Invalid hostname');
  }

  const firstDotIndex = hostname.indexOf('.');
  if (firstDotIndex === -1) {
    // e.g., "localhost", no subdomain
    throw new AppException(HttpStatusCode.BadRequest, 'Missing subdomain');
  }

  const subdomain = hostname.substring(0, firstDotIndex);
  if (!subdomain) {
    throw new AppException(HttpStatusCode.BadRequest, 'Invalid subdomain');
  }

  return subdomain;
}
