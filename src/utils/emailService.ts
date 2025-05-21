import nodemailer from 'nodemailer';
import config from '../config';
import logger from './logger';
import { SentMessageInfo } from 'nodemailer';

interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const createTestTransport = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const getTransporter = async () => {
  if (
    config.env === 'development' &&
    (!config.smtpConfig?.auth?.user || !config.smtpConfig?.auth?.pass)
  ) {
    return await createTestTransport();
  }

  return nodemailer.createTransport({
    host: config.smtpConfig?.host,
    port: config.smtpConfig?.port,
    secure: config.smtpConfig?.secure || false,
    auth: {
      user: config.smtpConfig?.auth?.user || '',
      pass: config.smtpConfig?.auth?.pass || '',
    },
  });
};

export const emailService = {
  sendMail: async (options: MailOptions) => {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: config.email?.from || 'noreply@example.com',
      ...options,
    });

    if (config.env === 'development') {
      const testUrl = nodemailer.getTestMessageUrl(info as SentMessageInfo);
      if (testUrl) {
        logger.info(`Preview email URL: ${testUrl}`);
      }
    }

    return info;
  },

  sendVerificationCodeEmail: async (email: string, code: string): Promise<void> => {
    await emailService.sendMail({
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}\nThis code will expire in 5 minutes.`,
    });
    logger.info(`Verification code sent to ${email}`);
  },
};

export default emailService;
