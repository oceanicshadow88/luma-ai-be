import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

import { ROLE, RoleType } from '../../config';
import { RegisterUserInput } from '../../controllers/auth/registerController';
import AppException from '../../exceptions/appException';
import ResetCodeModel from '../../models/resetCode';
import UserModel from '../../models/user';
import { VerifyCodeType } from '../../types/invitation';
import { membershipService } from '../membershipService';
import { userService } from '../userService';

// Create user and generate authentication tokens
const createUserAndTokens = async (userInput: RegisterUserInput, role: RoleType) => {
  // Validate verification code is checked in pre-check for admin register
  if (role === ROLE.LEARNER) {
    await checkVerificationCode(userInput.verifyValue, userInput.email);
  }
  // Create new user
  const newUser = await userService.createUser(userInput);
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

export const registerService = {
  teacherRegister: async (userInput: RegisterUserInput) => {
    const user = await UserModel.findOne({ email: userInput.email });
    //this need to be change to email
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'Non invited users');
    }

    // Update user data and save - this will trigger pre-save hook for password hashing
    Object.assign(user, userInput, { active: true });
    await user.save();

    const { refreshToken, accessToken } = await user.generateTokens();
    await userService.updateUserById(user.id, { refreshToken });

    return { refreshToken, accessToken };
  },
  // Register admin user and create admin membership
  adminRegister: async (userInput: RegisterUserInput) => {
    const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput, ROLE.ADMIN);

    // Create admin membership
    await membershipService.createAdminMembershipByUser(newUser, ROLE.ADMIN);

    return { refreshToken, accessToken };
  },

  // Register learner user and create learner membership for specific organization
  learnerRegister: async (userInput: RegisterUserInput, organizationId: string) => {
    const { newUser, refreshToken, accessToken } = await createUserAndTokens(
      userInput,
      ROLE.LEARNER,
    );

    // Create learner membership with organization association
    await membershipService.createMembership({
      user: newUser._id as Types.ObjectId,
      company: new Types.ObjectId(organizationId),
      role: ROLE.LEARNER,
    });
    return { refreshToken, accessToken };
  },
};

export const checkVerificationCode = async (verifyValue: string, email: string) => {
  if (!verifyValue) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Verification code is required');
  }
  const resetCode = await ResetCodeModel.findOne({
    email,
    verifyType: VerifyCodeType.VERIFICATION,
  });
  if (!resetCode) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid verification code');
  }

  const { isValid, message } = await resetCode.validateResetCode(verifyValue);
  if (!isValid) {
    throw new AppException(HttpStatusCode.Unauthorized, message);
  }
};
