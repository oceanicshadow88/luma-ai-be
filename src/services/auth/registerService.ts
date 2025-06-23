import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

import { ROLE } from '../../config';
import { RegisterUserInput } from '../../controllers/auth/registerController';
import AppException from '../../exceptions/appException';
import ResetCodeModel from '../../models/resetCode';
import UserModel from '../../models/user';
<<<<<<< HEAD
import { VerifyCodeType } from '../../types/invitation';
=======
>>>>>>> 2fde4d7 (fix: luma7 solve conflict save for vertify code and invatation link)
import { membershipService } from '../membershipService';
import { userService } from '../userService';

// Create user and generate authentication tokens
const createUserAndTokens = async (userInput: RegisterUserInput) => {
  // Validate verification code if provided
  // if (userInput.verifyValue) {
  //   await checkVerificationCode(userInput.verifyValue, userInput.email);
  // }
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
      throw new Error('Cannot find user');
    }
    const updateUser = await UserModel.findOneAndUpdate({ email: userInput.email }, userInput, {
      new: true,
    });
    await updateUser;
  },
  // Register admin user and create admin membership
  adminRegister: async (userInput: RegisterUserInput) => {
    const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput);

    // Create admin membership
    await membershipService.createAdminMembershipByUser(newUser, ROLE.ADMIN);

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
