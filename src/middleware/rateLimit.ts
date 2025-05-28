import { rateLimit } from 'express-rate-limit';
import config from '../config';

const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMS,
  max: config.rateLimit,
  legacyHeaders: false,
  skip: () => config.env !== 'production',
});

export default rateLimiter;
