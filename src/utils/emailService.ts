import nodemailer from 'nodemailer';
import config from '../config';
import logger from './logger';

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
      sendMail: (mailOptions: any) => {
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

/**
 * Send verification code email
 */
export const sendVerificationCodeEmail = async (
  email: string,
  verificationCode: string,
): Promise<boolean> => {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: config.emailFrom || 'noreply@luma-ai.com',
      to: email,
      subject: 'Your Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Requested</h2>
          <p>We received a request to reset your password. Please use the following verification code to proceed with your password reset:</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${verificationCode}</strong>
          </div>
          
          <p>This code will expire in 5 minutes.</p>
          
          <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
          
          <p>Thank you,<br>The LUMA AI Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Check if we're using Ethereal email (test account)
    if (
      config.env === 'development' &&
      typeof info === 'object' &&
      info !== null &&
      'user' in info
    ) {
      try {
        // Use type assertion to avoid TypeScript errors
        const testMessageUrl = nodemailer.getTestMessageUrl(info as any);
        if (testMessageUrl) {
          logger.info(`Preview URL: ${testMessageUrl}`);
        }
      } catch (err) {
        logger.warn('Could not get test message URL:', { payload: err });
      }
    }

    logger.info(`Verification code email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Failed to send verification code email:', { payload: error });
    return false;
  }
};

export default {
  sendVerificationCodeEmail,
};
