import chalk from 'chalk';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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

      new DailyRotateFile({
        dirname: 'logs/combined',
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxSize: '20m',
        maxFiles: '1d',
      }),

      new DailyRotateFile({
        dirname: 'logs/error',
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '10d',
      }),
    ],
  });
  return logger;
};

const logger = createLogger();

export default logger;
