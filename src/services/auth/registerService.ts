import ResetCodeModel from '../../models/resetCode';
import { userService } from '../userService';
import { membershipService } from '../membershipService';
import { ROLE } from '../../config';
import AppException from '../../exceptions/appException';
import { HttpStatusCode } from 'axios';
<<<<<<< HEAD
import { RegisterUserInput } from '../../controllers/auth/registerController';
=======
import { RegistUserInput } from '../../controllers/auth/registerController';
import { Types } from 'mongoose';
>>>>>>> e6974a8 (feat: add student registration logic)

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
    await membershipService.createAdminMembershipByUser(newUser, ROLE.ADMIN);

    return { refreshToken, accessToken, user: newUser };
  },

  studentRegister: async (userInput: RegisterUserInput, organizationId: string) => {
    const result = await registerService.userRegister(userInput);
    // Create student membership directly
    await membershipService.createMembership({
      user: result.user._id as Types.ObjectId,
      company: new Types.ObjectId(organizationId),
      role: ROLE.STUDENT,
    });
    return { refreshToken: result.refreshToken, accessToken: result.accessToken };
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
