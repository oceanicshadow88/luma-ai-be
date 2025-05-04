import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

interface Config {
  env: string;
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  rateLimitWindowMS: number;
  rateLimit: number;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/luma-ai',
  jwtSecret: process.env.JWT_SECRET || 'jwt_secret',
  jwtExpiresIn: '1d',
  rateLimitWindowMS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimit: parseInt(process.env.RATE_LIMIT || '100', 10),
};

export default config;
