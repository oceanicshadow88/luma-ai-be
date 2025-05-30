import ResetCodeModel from '../../models/resetCode';
import { userService } from '../userService';
import { membershipService } from '../membershipService';
import { ROLE } from '../../config';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { RegisterUserInput } from '../../controllers/auth/registerController';

export const registerService = {
  // get adminUserInput
  userRegister: async (userInput: RegisterUserInput) => {
    // verify code to register
    if (userInput.verifyCode) {
      await checkVerificationCode(userInput.verifyCode, userInput.email);
    } // create user
    const newUser = await userService.createUser(userInput);
    // generate Token
    const { refreshToken, accessToken } = await newUser.generateTokens();
    await userService.updateUserById(newUser.id, { refreshToken });
    // create membership
    await membershipService.createMembershipByUser(newUser, ROLE.ADMIN);

    return { refreshToken, accessToken };
  },
};

// verify code
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
