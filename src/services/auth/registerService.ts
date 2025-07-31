import { ROLE } from '@src/config';
import { RegisterUserInput } from '@src/controllers/auth/registerController';
import AppException from '@src/exceptions/appException';
import MembershipModel from '@src/models/membership';
import ResetCodeModel from '@src/models/resetCode';
import UserModel from '@src/models/user';
import { membershipService } from '@src/services/membershipService';
import { userService } from '@src/services/userService';
import { VerifyCodeType } from '@src/types/invitation';
import { verifyInvitationToken } from '@src/utils/invitationLink';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

// Create user and generate authentication tokens
const createUserAndTokens = async (userInput: RegisterUserInput) => {
  const newUser = await userService.createUser(userInput);
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

export const registerService = {
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
    await checkVerificationCode(userInput.verifyValue, userInput.email);

    const user = await UserModel.findOne({ email: userInput.email });
    if (user && user.active === false) {
      Object.assign(user, userInput, { active: true });
      await user.save();
      const tokens = await user.generateTokens();
      await userService.updateUserById(user.id, { refreshToken: tokens.refreshToken });
      return { refreshToken: tokens.refreshToken, accessToken: tokens.accessToken };
    }
    if (user && user.active === true) {
      //TODO: What to do
    }

    // Create a new user
    const userExistWithUsername = await UserModel.findOne({ username: userInput.username });
    if (userExistWithUsername) {
      throw new AppException(
        HttpStatusCode.Conflict,
        'Username already in use. Try a different one.',
        { field: 'username' },
      );
    }
    const result = await createUserAndTokens(userInput);
    return { refreshToken: result.refreshToken, accessToken: result.accessToken };
  },

  // Register learner user and create learner membership for specific organization
  learnerRegister: async (userInput: RegisterUserInput, organizationId: string) => {
    await checkVerificationCode(userInput.verifyValue, userInput.email);

    // Check learner exist in this company
    const existingUser = await UserModel.findOne({ email: userInput.email });

    if (!existingUser) {
      const userExistWithUsername = await UserModel.findOne({ username: userInput.username });

      if (userExistWithUsername) {
        throw new AppException(
          HttpStatusCode.Conflict,
          'Username already in use. Try a different one.',
          { field: 'username' },
        );
      }
      const { newUser, refreshToken, accessToken } = await createUserAndTokens(userInput);

      await membershipService.createMembership({
        user: newUser._id as Types.ObjectId,
        company: new Types.ObjectId(organizationId),
        role: ROLE.LEARNER,
      });

      return { refreshToken, accessToken };
    }
    existingUser.active = true;
    await existingUser.save();
    const existingLearnerMembership = await MembershipModel.findOne({
      user: existingUser._id,
      company: organizationId,
      status: 'active',
    });

    if (existingLearnerMembership) {
      throw new AppException(HttpStatusCode.Conflict, 'Email already registered. Please log in.', {
        field: 'email',
      });
    }

    // User exist but not this company or in this company but not learner
    // await membershipService.createMembership({
    //   user: existingUser._id as Types.ObjectId,
    //   company: new Types.ObjectId(organizationId),
    //   role: ROLE.LEARNER,
    // });

    const { refreshToken, accessToken } = await existingUser.generateTokens();
    await userService.updateUserById(existingUser.id, { refreshToken });

    return { existingUser, refreshToken, accessToken };
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
