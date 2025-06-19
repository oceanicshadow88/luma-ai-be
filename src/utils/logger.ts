import chalk from 'chalk';
import path from 'path';
import winston from 'winston';

import config from '../config';

export const createLogger = (filename?: string): winston.Logger => {
  const logger = winston.createLogger({
    level: config.logLevel || 'info',
    defaultMeta: {
      filename: filename ? path.basename(String(filename)) : undefined,
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, filename, ...meta }) => {
        const fileInfo = typeof filename === 'string' ? `[${filename}]` : '';
        const payloadInfo =
          meta && Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}][${level.toUpperCase()}] ${fileInfo} ${message}${payloadInfo}`;
      }),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.printf(({ level, message }) => {
          if (level === 'error') return chalk.red(`[ERROR] ${message}`);
          if (level === 'warn') return chalk.yellow(`[WARN] ${message}`);
          if (level === 'info') return chalk.blue(`[INFO] ${message}`);
          return chalk.white(`[${level.toUpperCase()}] ${message}`); // fallback for other levels
        }),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
    ],
  });
  return logger;
};

const logger = createLogger();

export default logger;
