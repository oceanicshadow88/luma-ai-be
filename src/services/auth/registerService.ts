import { ROLE } from '@src/config';
import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import ResetCodeModel from '@src/models/resetCode';
import UserModel, { USER_STATUS } from '@src/models/user';
import { userService } from '@src/services/userService';
import { VerifyCodeType } from '@src/types/invitation';
import { verifyInvitationToken } from '@src/utils/invitationLink';
import { HttpStatusCode } from 'axios';

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
      role: ROLE.ADMIN,
    });

    if (!user) {
      await checkVerificationCode(userInput.verifyValue, userInput.email);

      const result = await createUserAndTokens(
        {
          ...userInput,
          ...{ role: ROLE.ADMIN, status: USER_STATUS.ACTIVE },
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
      ...{ status: USER_STATUS.ACTIVE, refreshToken, role: ROLE.ADMIN },
    };
    await userService.updateUserById(user.id, updatedUser);
    return { refreshToken, accessToken };
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
        ...{ role: ROLE.LEARNER, status: USER_STATUS.ACTIVE },
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
      ...{ status: USER_STATUS.ACTIVE, refreshToken, role: ROLE.LEARNER },
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
