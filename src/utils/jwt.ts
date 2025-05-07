import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import config, { StringValue } from '../config';
import logger from './logger';

const secret: Secret = config.jwtSecret;

export const generateToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as StringValue,
  };
  return jwt.sign(payload, secret, options);
};

export const validateToken = (token: string): JwtPayload | string | null => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Jwt verify error:', { payload: error });
    return null;
  }
};
