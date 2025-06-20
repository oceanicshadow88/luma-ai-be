import { HttpStatusCode } from 'axios';
import { customAlphabet } from 'nanoid';

import AppException from '../exceptions/appException';
import UserModel from '../models/user';
import logger from '../utils/logger';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
const MAX_RETRIES = 10;

/**
 * Generate a unique random username, such as user_ab12cd34,
 * ensuring no duplicates in the database.
 */
export const generateRandomUsername = async (): Promise<string> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const username = `user_${nanoid()}`;
    const existingUser = await UserModel.findOne({ username }).lean();

    if (!existingUser) {
      logger.info(`✅ Unique username generated after ${attempt} attempts: ${username}`);
      return username;
    }

    logger.warn(`⚠️ Username collision detected [Attempt ${attempt}]: ${username}`);
  }

  throw new AppException(
    HttpStatusCode.InternalServerError,
    `❌ Failed to generate a unique username after ${MAX_RETRIES} attempts.`,
  );
};
