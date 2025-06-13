import config from '@src/config';
import path from 'path';
import winston from 'winston';

export const createLogger = (filename?: string): winston.Logger => {
  const logger = winston.createLogger({
    level: config.logLevel,
    defaultMeta: {
      filename: filename ? path.basename(String(filename)) : undefined,
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, filename, level, message, payload }) => {
        const fileInfo = typeof filename === 'string' ? `[${filename}]` : '';
        const payloadInfo = payload ? `\n${JSON.stringify(payload, null, 2)}` : '';
        return `[${timestamp}][${level}] ${fileInfo}: ${message}${payloadInfo}`;
      }),
    ),
    transports: [
      new winston.transports.Console(),
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
