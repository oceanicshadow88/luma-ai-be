import ResetCodeModel from '../../models/resetCode';
import { userService } from '../userService';
import { membershipService } from '../membershipService';
import { ROLE, RoleType } from '../../config';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { RegisterUserInput } from '../../controllers/auth/registerController';

const registerUser = async (userInput: RegisterUserInput, role: RoleType) => {
  const newUser = await userService.createUser(userInput);
  // generate Token
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });
  // create membership
  await membershipService.createMembershipByUser(newUser, role);

  return { refreshToken, accessToken };
};

export const registerService = {
  // get adminUserInput
  teacherRegister: async (userInput: RegisterUserInput) => {
    //this need to be change to email
    if (userInput.verifyValue) {
      await checkVerificationCode(userInput.verifyValue, userInput.email);
    } // create user
    return registerUser(userInput, ROLE.INSTRUCTOR);
  },
  adminRegister: async (userInput: RegisterUserInput) => {
    // verify code to register
    if (userInput.verifyValue) {
      await checkVerificationCode(userInput.verifyValue, userInput.email);
    } // create user
    return registerUser(userInput, ROLE.ADMIN);
  },
};

// verify code
export const checkVerificationCode = async (verifyValue: string, email: string) => {
  if (!verifyValue) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Verification code is required');
  }

  const resetCode = await ResetCodeModel.findOne({ email });
  if (!resetCode) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid verification code');
  }

  const { isValid, message } = await resetCode.validateResetCode(verifyValue);
  if (!isValid) {
    throw new AppException(HttpStatusCode.Unauthorized, message);
  }
};
