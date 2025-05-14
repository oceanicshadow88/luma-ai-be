import bcrypt from 'bcryptjs';
import { emailService } from '../utils/emailService';

export const generateVerificationCode = (): string => {
  // Generate a random 4-digit number
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return code;
};

export const hashVerificationCode = async (code: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code, salt);
};

export const verifyCode = async (plainCode: string, hashedCode: string): Promise<boolean> => {
  return bcrypt.compare(plainCode, hashedCode);
};

export const sendVerificationEmail = async (email: string, code: string) => {
  const subject = 'Your Verification Code';
  const text = `Your verification code is: ${code}. This code will expire in 5 minutes.`;

  return await emailService.sendMail({
    to: email,
    subject,
    text,
  });
};
