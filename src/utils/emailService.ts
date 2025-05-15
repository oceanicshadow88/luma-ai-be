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

// Create nodemailer transporter using SMTP or test account
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

    if (config.env === 'development' && 'user' in info) {
      try {
        const testMessageUrl = nodemailer.getTestMessageUrl(info as SentMessageInfo);
        if (testMessageUrl) {
          logger.info(`Preview URL: ${testMessageUrl}`);
        }
      } catch (err) {
        logger.warn('Could not get test message URL:', { payload: err });
      }
    }

    return info;
  },

  sendVerificationCodeEmail: async (email: string, code: string): Promise<boolean> => {
    try {
      await emailService.sendMail({
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}\nThis code will expire in 5 minutes.`,
      });
      logger.info(`Verification code sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send verification code:', { error });
      return false;
    }
  },
};

// Helper function to create test transport
const createTestTransport = async () => {
  try {
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
  } catch (error) {
    logger.error('Failed to create test email account:', { payload: error });
    return {
      sendMail: (mailOptions: MailOptions) => {
        logger.info('Email would be sent in production:', { payload: mailOptions });
        return Promise.resolve({ messageId: 'mock-id' });
      },
    };
  }
};

export default emailService;
