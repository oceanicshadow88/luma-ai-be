import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import AppException from '../exceptions/appException';

/**
 * Extract frontend base URL from request headers
 * @param req - Express request object
 * @returns Frontend base URL or null if not found
 */
function extractFrontendBaseUrl(req: Request): string | null {
  // Try to get from Origin header (for CORS requests)
  if (req.headers.origin) {
    return req.headers.origin;
  }
  // Try to get from Referer header
  if (req.headers.referer) {
    // Validate URL format before using
    if (!req.headers.referer.match(/^https?:\/\/.+/)) {
      throw new AppException(HttpStatusCode.BadRequest, 'Invalid referer URL format');
    }

    const url = new URL(req.headers.referer);
    return `${url.protocol}//${url.host}`;
  }

  // Try to construct from Host header
  if (req.headers.host) {
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    return `${protocol}://${req.headers.host}`;
  }

  return null;
}

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
