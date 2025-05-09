import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport(config.email);
  return await transporter.sendMail({
    from: config.email.from,
    ...options,
  });
};
