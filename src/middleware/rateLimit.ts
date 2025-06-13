import config from '@src/config';
import { rateLimit } from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMS,
  max: config.rateLimit,
  legacyHeaders: false,
  skip: () => config.env !== 'production',
});

export default rateLimiter;
