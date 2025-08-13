import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import CompanyModel from '@src/models/company';
import ResetCodeModel from '@src/models/resetCode';
import UserModel, { User, USER_STATUS } from '@src/models/user';
import { companyService } from '@src/services/companyService';
import { userService } from '@src/services/userService';
import { CompanyPlanType, LocaleType, ROLES } from '@src/types/constants';
import { VerifyCodeType } from '@src/types/invitation';
import { verifyInvitationToken } from '@src/utils/invitationLink';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

interface RegisterCompanyOwnerInput {
  companyName: string;
  plan?: CompanyPlanType;
  slug: string;
  logoUrl?: string;
  settings?: {
    timezone?: string;
    locale?: LocaleType;
    primaryColor?: string;
  };
  email: string;
}

// Create user and generate authentication tokens
const createUserAndTokens = async (userInput: RegisterUserInput, companyId?: string) => {
  let newUser = null;
  if (companyId) {
    newUser = await userService.createUser({ ...userInput, company: companyId });
  } else {
    newUser = await userService.createUser({ ...userInput });
  }
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

const getInviteUser = async (userInput: RegisterUserInput, companyId: string) => {
  const user = await UserModel.findOne({ email: userInput.email, company: companyId });
  if (!user) {
    throw new AppException(HttpStatusCode.NotFound, 'Non invited users');
  }
  if (user.status === 'active') {
    throw new AppException(HttpStatusCode.Conflict, 'User already exists.');
  }

  const userExistWithUsername = await UserModel.exists({
    username: userInput.username,
    companyId: companyId,
  });
  if (userExistWithUsername) {
    throw new AppException(
      HttpStatusCode.Conflict,
      'Username already in use. Try a different one.',
      { field: 'username' },
    );
  }
  return user;
};

export const registerService = {
  instructorRegister: async (userInput: RegisterUserInput, companyId: string) => {
    await verifyInvitationToken(userInput.verifyValue);

    const invitedUser = await getInviteUser(userInput, companyId);

    const { refreshToken, accessToken } = await invitedUser.generateTokens();
    const updatedUser = {
      ...invitedUser,
      ...userInput,
      ...{ status: USER_STATUS.ACTIVE, refreshToken },
    };
    await userService.updateUserById(invitedUser.id, updatedUser);

    return { refreshToken, accessToken };
  },

  // Register admin user and create admin membership
  adminRegister: async (userInput: RegisterUserInput) => {
    const user = await UserModel.findOne({
      email: userInput.email,
      role: ROLES.ADMIN,
    });

    if (!user) {
      await checkVerificationCode(userInput.verifyValue, userInput.email);

      const result = await createUserAndTokens(
        {
          ...userInput,
          ...{ role: ROLES.ADMIN, status: USER_STATUS.ACTIVE },
        },
        '',
      );
      return { refreshToken: result.refreshToken, accessToken: result.accessToken };
    }

    if (user.status === USER_STATUS.ACTIVE) {
      throw new AppException(HttpStatusCode.Conflict, 'Email already exists.', {
        field: 'email',
      });
    }

    const { refreshToken, accessToken } = await user.generateTokens();
    const updatedUser = {
      ...user,
      ...userInput,
      ...{ status: USER_STATUS.ACTIVE, refreshToken, role: ROLES.ADMIN },
    };
    await userService.updateUserById(user.id, updatedUser);
    return { refreshToken, accessToken };
  },

  // Register admin user and new company, set admin user as company owner, then create membership
  registerCompanyWithOwner: async (ownerInput: RegisterCompanyOwnerInput) => {
    // check company slug
    const companyExistBySlug = await CompanyModel.findOne({ slug: ownerInput.slug });
    if (companyExistBySlug) {
      throw new AppException(HttpStatusCode.Conflict, 'Slug already in use. Try a different one.', {
        field: 'slug',
      });
    }

    let user: User | null = await UserModel.findOne({ email: ownerInput.email });
    if (!user) {
      throw new AppException(HttpStatusCode.Unauthorized, 'User not found');
    }

    // create company
    const newCompany = await companyService.createCompany({
      companyName: ownerInput.companyName,
      slug: ownerInput.slug,
      plan: ownerInput.plan,
      owner: user._id as Types.ObjectId,
      logoUrl: ownerInput.logoUrl,
      settings: ownerInput.settings,
    });

    if (!newCompany._id) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Company creation failed');
    }

    user.company = newCompany._id as Types.ObjectId;
    const { refreshToken, accessToken } = await user.generateTokens();
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  },

  // Register learner user and create learner membership for specific organization
  learnerRegister: async (userInput: RegisterUserInput, companyId: string) => {
    const user = await UserModel.findOne({
      email: userInput.email,
      company: companyId,
    });

    if (!user) {
      await checkVerificationCode(userInput.verifyValue, userInput.email);

      const newUser = await userService.createUser({
        ...userInput,
        ...{ role: ROLES.LEARNER, status: USER_STATUS.ACTIVE },
        company: companyId,
      });
      const { refreshToken, accessToken } = await newUser.generateTokens();
      await userService.updateUserById(newUser.id, { refreshToken });

      return { refreshToken: refreshToken, accessToken: accessToken };
    }

    if (user.status === USER_STATUS.ACTIVE) {
      throw new AppException(HttpStatusCode.Conflict, 'Email already exists.', {
        field: 'email',
      });
    }

    const { refreshToken, accessToken } = await user.generateTokens();
    const updatedUser = {
      ...user,
      ...userInput,
      ...{ status: USER_STATUS.ACTIVE, refreshToken, role: ROLES.LEARNER },
    };
    await userService.updateUserById(user.id, updatedUser);
    return { refreshToken, accessToken };
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
