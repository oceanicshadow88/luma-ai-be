import { ROLE } from '@src/config';
import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import { membershipService } from '@src/services/membershipService';
import { userService } from '@src/services/userService';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

// Create user and generate authentication tokens
const createUserAndTokens = async (userInput: RegisterUserInput) => {
  // Validate verification code if provided
  if (userInput.verifyCode) {
    await checkVerificationCode(userInput.verifyCode, userInput.email);
  }
  // Create new user
  const newUser = await userService.createUser(userInput);
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

export const registerService = {
  // Register admin user and create admin membership
  adminRegister: async (userInput: RegisterUserInput) => {
    const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput);

    // Create admin membership
    await membershipService.createMembershipByUser(newUser, ROLE.ADMIN);

    return { refreshToken, accessToken };
  },

  // Register learner user and create learner membership for specific organization
  learnerRegister: async (userInput: RegisterUserInput, organizationId: string) => {
    const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput);

    // Create learner membership with organization association
    await membershipService.createMembership({
      user: newUser._id as Types.ObjectId,
      company: new Types.ObjectId(organizationId),
      role: ROLE.LEARNER,
    });

    return { refreshToken, accessToken };
  },
};

// Verify the provided verification code
export const checkVerificationCode = async (verifyCode: string, email: string) => {
  if (!verifyCode) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Verification code is required');
  }

  const resetCode = await ResetCodeModel.findOne({ email });
  if (!resetCode) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid verification code');
  }

  const { isValid, message } = await resetCode.validateResetCode(verifyCode);
  if (!isValid) {
    throw new AppException(HttpStatusCode.Unauthorized, message);
  }
};
