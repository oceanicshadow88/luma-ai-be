import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

import AppException from '../exceptions/appException';
import { extractFrontendBaseUrl } from '../utils/invitationLink';

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
