import Company from '../models/company';
import { Types } from 'mongoose';
import User from '../models/user';
import { generateVerificationCode, sendVerificationEmail } from '../utils/verification';
import { generateAccessToken, generateRefreshToken } from '../utils/auth';

// 使用 Map 在内存中临时存储验证码
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
  active?: boolean;
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

    // Extract domain from email
    const domain = userEmail.split('@')[1];

    // Check if company exists with this domain
    const existing = await Company.findOne({
      name: new RegExp(`^${name}$`, 'i'),
    });

    if (existing) {
      throw new Error('Company name already exists');
    }

    // Create company
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
    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Generate and store verification code
    const code = generateVerificationCode();
    verificationStore.set(email, {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      verified: false,
    });

    await sendVerificationEmail(email, code);
    return true;
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

    // Check if domain has organization
    const domain = email.split('@')[1];
    const existingCompany = await Company.findOne({ domain });

    return {
      hasOrganization: !!existingCompany,
      organizationId: existingCompany?._id,
    };
  },

  checkDomainAndCreate: async (
    email: string,
    organizationData: {
      name: string;
      logo?: string;
    },
  ) => {
    const domain = email.split('@')[1];
    const existingCompany = await Company.findOne({ domain });

    if (existingCompany) {
      return existingCompany;
    }

    return await Company.create({
      ...organizationData,
      domain,
      plan: 'free',
      active: true,
    });
  },

  completeRegistration: async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'instructor';
    companyId: string;
  }) => {
    // Create user
    const user = await User.create({
      ...userData,
      active: true,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
      redirectPath: userData.role === 'admin' ? '/dashboard/admin' : '/dashboard/instructor',
    };
  },
};
