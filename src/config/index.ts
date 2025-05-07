import dotenv from 'dotenv';

const env: string = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

export type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

interface Config {
  env: string;
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpiresIn: StringValue;
  rateLimitWindowMS: number;
  rateLimit: number;
  logLevel: string;
}

const config: Config = {
  env,
  port: parseInt(process.env.PORT || '8000', 10),
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/luma-ai',
  jwtSecret: process.env.JWT_SECRET || 'jwt_secret',
  jwtExpiresIn: '1d' as StringValue,
  rateLimitWindowMS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimit: parseInt(process.env.RATE_LIMIT || '100', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
