import Company from '../models/company';
import { Types } from 'mongoose';
import User from '../models/user';
import { generateVerificationCode, sendVerificationEmail } from '../utils/verification';
import { generateAccessToken, generateRefreshToken } from '../utils/auth';
import { redisClient } from '../utils/redis';
import { membershipService } from './membershipService';
import crypto from 'crypto';
import { emailService } from '../utils/emailService';

const verificationStore = new Map<
  string,
  {
    code: string;
    expiresAt: Date;
    verified: boolean;
  }
>();

interface CompanyInput {
  name: string;
  plan: string;
  ownerId: string;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  userEmail: string;
}

interface CompanyUpdate {
  name?: string;
  plan?: string;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  active?: boolean;
}

export const companyService = {
  createCompany: async (data: CompanyInput) => {
    const { name, plan, ownerId, settings, userEmail } = data;
    const _domain = userEmail.split('@')[1];

    const existing = await Company.findOne({
      name: new RegExp(`^${name}$`, 'i'),
    });

    if (existing) {
      throw new Error('Company name already exists');
    }

    return await Company.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      plan,
      ownerId: new Types.ObjectId(ownerId),
      settings,
    });
  },

  getCompanyById: async (id: string) => {
    return await Company.findOne({ _id: id, active: true });
  },

  getCompaniesByOwnerId: async (ownerId: string) => {
    return await Company.find({ ownerId, active: true });
  },

  updateCompany: async (id: string, data: CompanyUpdate) => {
    const { name } = data;
    if (name) {
      const existing = await Company.findOne({ name, _id: { $ne: id } });
      if (existing) {
        throw new Error('Company name already exists');
      }
    }
    return await Company.findByIdAndUpdate(
      id,
      { ...data, ...(name && { slug: name.toLowerCase().replace(/\s+/g, '-') }) },
      { new: true },
    );
  },

  deleteCompany: async (id: string) => {
    return await Company.findByIdAndDelete(id);
  },

  checkEmailAndSendCode: async (email: string) => {
    const rateLimitKey = `verification:${email}`;
    const lastSent = await redisClient.get(rateLimitKey);
    if (lastSent) {
      throw new Error('Please wait before requesting another code');
    }

    const VERIFICATION_EXPIRES = 15 * 60;
    const code = generateVerificationCode();
    verificationStore.set(email, {
      code,
      expiresAt: new Date(Date.now() + VERIFICATION_EXPIRES * 1000),
      verified: false,
    });

    await redisClient.setex(rateLimitKey, 60, 'true');
    await sendVerificationEmail(email, code);

    // 在开发环境下返回验证码
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        message: 'Verification code sent',
        code: code,
      };
    }

    return {
      success: true,
      message: 'Verification code sent',
    };
  },

  verifyCode: async (email: string, code: string) => {
    const verification = verificationStore.get(email);

    if (!verification) {
      throw new Error('No verification code found');
    }

    if (verification.expiresAt < new Date()) {
      verificationStore.delete(email);
      throw new Error('Verification code expired');
    }

    if (verification.code !== code) {
      throw new Error('Invalid verification code');
    }

    if (verification.verified) {
      throw new Error('Code already verified');
    }

    verification.verified = true;
    verificationStore.set(email, verification);

    // Check if organization exists for this email domain
    const domain = email.split('@')[1];
    const existingCompany = await Company.findOne({
      name: new RegExp(`^${domain}$`, 'i'),
    });

    return {
      hasOrganization: !!existingCompany,
      organizationId: existingCompany?._id,
    };
  },

  checkDomainAndCreate: async (
    email: string,
    organizationData: {
      name: string;
      logoUrl?: string;
    },
  ) => {
    const domain = email.split('@')[1];
    const existingCompany = await Company.findOne({
      name: new RegExp(`^${domain}$`, 'i'),
    });

    if (existingCompany) {
      return {
        exists: true,
        company: existingCompany,
      };
    }

    const company = await Company.create({
      name: organizationData.name || domain,
      slug: organizationData.name.toLowerCase().replace(/\s+/g, '-'),
      settings: {
        logoUrl: organizationData.logoUrl || '',
      },
      plan: 'free',
      active: true,
    });

    return {
      exists: false,
      company,
    };
  },

  completeRegistration: async (data: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'instructor';
    companyId: string;
  }) => {
    const { email, password, name, role, companyId } = data;

    const user = await User.create({
      email,
      password,
      name,
      active: true,
    });

    await membershipService.createMembership({
      userId: (user._id as Types.ObjectId).toString(),
      companyId,
      role,
      status: 'active',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
      redirectPath: role === 'admin' ? '/dashboard/admin' : '/dashboard/instructor',
    };
  },

  createInvite: async (companyId: string, email: string, role: 'admin' | 'instructor') => {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    await redisClient.setex(
      `invite:${token}`,
      24 * 60 * 60,
      JSON.stringify({ companyId, email, role }),
    );

    const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/invites/${token}`;
    await emailService.sendMail({
      to: email,
      subject: `Invitation to Join ${company.name}`,
      text: `You have been invited to join ${company.name} as ${role}.\nPlease click the link below to accept:\n${inviteLink}`,
    });

    return { token };
  },

  findCompanyByEmailDomain: async (email: string) => {
    const domain = email.split('@')[1];
    return await Company.findOne({
      emailDomains: domain,
      active: true,
    });
  },

  validateInvite: async (token: string, email: string) => {
    const inviteData = await redisClient.get(`invite:${token}`);
    if (!inviteData) {
      return { valid: false, message: 'Invalid or expired invitation' };
    }

    const { companyId, invitedEmail, role } = JSON.parse(inviteData);
    if (email !== invitedEmail) {
      return { valid: false, message: 'Email does not match invitation' };
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return { valid: false, message: 'Company not found' };
    }

    return { valid: true, company, role };
  },
};
