import mongoose, { Types } from 'mongoose';

import { EXPIRES_TIME_CONFIG, MEMBERSHIP_STATUS, ROLE } from '../config';
import { RegisterUserInput } from '../controllers/auth/registerController';
import { generateRandomUsername } from '../lib/generateRandomUsername';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '../types/invitation';
import { generateInvitationLink } from '../utils/invitationLink';
import { membershipService } from './membershipService';
import { userService } from './userService';

const createUserAndTokens = async (userInput: RegisterUserInput) => {
  const newUser = await userService.createUser(userInput);
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

export class InvitationService {
  static async generateInvitation(
    { email, role }: GenerateInvitationRequest,
    companyId: string,
  ): Promise<GenerateInvitationResponse> {
    const newUsername = await generateRandomUsername();
    const { newUser } = await createUserAndTokens({
      email,
      password: 'any',
      username: newUsername,
      firstName: 'Invited',
      lastName: 'Teacher',
      verifyValue: '888888',
    });
    await membershipService.createMembership({
      company: new mongoose.Types.ObjectId(companyId),
      user: newUser._id as Types.ObjectId,
      role: ROLE.INSTRUCTOR,
      status: MEMBERSHIP_STATUS.INVITED,
    });
    const invitationLink = await generateInvitationLink(email, role);

    return {
      invitationLink,
      email,
      role,
      expiresIn: EXPIRES_TIME_CONFIG.EXPIRES_IN_DISPLAY,
    };
  }
}
