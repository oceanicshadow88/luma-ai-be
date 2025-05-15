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

// Create a test account for development if SMTP settings are not provided
const createTestTransport = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    // Create a test transporter
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

    // Fallback to a mock transporter that just logs emails
    return {
      sendMail: (mailOptions: MailOptions) => {
        logger.info('Email would be sent in production:', { payload: mailOptions });
        return Promise.resolve({ messageId: 'mock-id' });
      },
    };
  }
};

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
    return await transporter.sendMail({
      from: config.email.from,
      ...options,
    });
  },

  sendVerificationCodeEmail: async (email: string, verificationCode: string): Promise<boolean> => {
    try {
      const transporter = await getTransporter();
      const mailOptions = {
        from: config.emailFrom || 'noreply@luma-ai.com',
        to: email,
        subject: 'Your Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Requested</h2>
            <p>We received a request to reset your password. Please use the following verification code to proceed:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
              <strong>${verificationCode}</strong>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

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

      return true;
    } catch (error) {
      logger.error('Failed to send verification code:', { payload: error });
      return false;
    }
  },
};

export default emailService;
