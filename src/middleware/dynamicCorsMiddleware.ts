import { RequestHandler } from 'express';
import cors from 'cors';
import tenantCorsService from '../services/tenantCorsService';
import { HttpStatusCode } from 'axios';
import AppException from '../exceptions/appException';

export const dynamicCorsMiddleware: RequestHandler = cors({
  origin: (origin, callback) => {
    // CORS origin resolver is not async, use Promise instead
    if (!origin) return callback(null, true);

    const url = new URL(origin);
    const hostname = url.hostname;

    // Allow *.lumaai.localhost in development/local environment
    if (
      (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') &&
      hostname.endsWith('.lumaai.localhost')
    ) {
      return callback(null, origin);
    }

    // In production, only allow tenant subdomains on lumaai.com
    if (hostname.endsWith('.lumaai.com')) {
      const slug = hostname.replace(/\.lumaai\.com$/, '');

      tenantCorsService
        .exists(slug)
        .then(exists => {
          if (!exists) throw new AppException(HttpStatusCode.NotFound, 'Company not found');
          return tenantCorsService.isActive(slug);
        })
        .then(isActive => {
          if (!isActive) throw new AppException(HttpStatusCode.Forbidden, 'Company is inactive');
          callback(null, origin);
        })
        .catch(callback);

      return;
    }

    // Reject all other origins
    return callback(new AppException(HttpStatusCode.Forbidden, `Unauthorized origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
});
