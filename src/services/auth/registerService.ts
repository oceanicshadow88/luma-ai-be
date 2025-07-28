import { CompanyPlanType, LocaleType, ROLE } from '@src/config';
import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { companyService } from '@src/services/companyService';
import { membershipService } from '@src/services/membershipService';
import { userService } from '@src/services/userService';
import { VerifyCodeType } from '@src/types/invitation';
import { extractCompanySlugFromEmail } from '@src/utils/extractCompanySlugFromEmail';
import { verifyInvitationToken } from '@src/utils/invitationLink';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

interface RegisterCompanyOwnerInput {
  companyName: string;
  plan?: CompanyPlanType;
  logoUrl?: string;
  settings?: {
    timezone?: string;
    locale?: LocaleType;
    primaryColor?: string;
  };
  pendingUser: RegisterUserInput;
}

// Create user and generate authentication tokens
const createUserAndTokens = async (userInput: RegisterUserInput) => {
  const newUser = await userService.createUser(userInput);
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

export const registerService = {
  // Register learner user and create learner membership for specific organization
  learnerRegister: async (userInput: RegisterUserInput, organizationId: string) => {
    await userService.checkUserConflict(userInput.email, userInput.username);
    await checkVerificationCode(userInput.verifyValue, userInput.email);

    const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput);

    // Create learner membership with organization association
    await membershipService.createMembership({
      user: newUser._id as Types.ObjectId,
      company: new Types.ObjectId(organizationId),
      role: ROLE.LEARNER,
    });
    return { refreshToken, accessToken };
  },

  teacherRegister: async (userInput: RegisterUserInput) => {
    const userExistWithUsername = await UserModel.findOne({ username: userInput.username });
    if (userExistWithUsername) {
      throw new AppException(
        HttpStatusCode.Conflict,
        'Username already in use. Try a different one.',
        { field: 'username' },
      );
    }

    const user = await UserModel.findOne({ email: userInput.email });
    //this need to be change to email
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'Non invited users');
    }

    // check the token
    await verifyInvitationToken(userInput.verifyValue);

    // Update user data and save - this will trigger pre-save hook for password hashing
    Object.assign(user, userInput, { active: true });
    await user.save();

    const { refreshToken, accessToken } = await user.generateTokens();
    await userService.updateUserById(user.id, { refreshToken });

    return { refreshToken, accessToken };
  },

  // Register admin user and create admin membership
  adminRegister: async (userInput: RegisterUserInput) => {
    const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput);

    // Create admin membership
    await membershipService.createAdminMembershipByUser(newUser, ROLE.ADMIN);

    return { refreshToken, accessToken };
  },

  // Register admin user and new company, set admin user as company owner, then create membership
  companyOwnerRegister: async (ownerInput: RegisterCompanyOwnerInput) => {
    const slug = await extractCompanySlugFromEmail(ownerInput.pendingUser.email);

    const newUser = await userService.createUser(ownerInput.pendingUser);
    if (!newUser) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Company owner creation failed');
    }

    const newCompany = await companyService.createCompany({
      companyName: ownerInput.companyName,
      slug,
      plan: ownerInput.plan,
      owner: newUser._id as Types.ObjectId,
      logoUrl: ownerInput.logoUrl,
      settings: ownerInput.settings,
    });
    if (!newCompany) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Company creation failed');
    }

    // create membership
    const newMembership = await membershipService.createMembership({
      user: newUser.id,
      company: newCompany.id,
      role: ROLE.ADMIN,
    });

    return {
      user: {
        username: newUser.username,
        email: newUser.email,
      },
      company: {
        companyName: newCompany.companyName,
        slug: newCompany.slug,
      },
      membership: {
        role: newMembership.role,
      },
    };
  },
};

export const checkVerificationCode = async (verifyValue: string, email: string) => {
  const resetCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  });
  if (!resetCode) {
    throw new AppException(
      HttpStatusCode.Unauthorized,
      'Invalid or expired verification value. Please request a new one.',
      {
        field: 'verificationCode',
        payload: `ResetCode not exist with email ${email} for ${VerifyCodeType.VERIFICATION}`,
      },
    );
  }

  await resetCode.validateResetCode(verifyValue);
  await resetCode.deleteOne();
};
