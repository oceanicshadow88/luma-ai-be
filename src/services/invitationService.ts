import mongoose, { Types } from 'mongoose';
import { LocaleType } from 'src/config';

import { EXPIRES_TIME_CONFIG, MEMBERSHIP_STATUS, ROLE } from '../config';
import { generateRandomUsername } from '../lib/generateRandomUsername';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '../types/invitation';
import { generateInvitationLinkAndStoreToken } from '../utils/invitationLink';
import { membershipService } from './membershipService';
import { userService } from './userService';

export interface RegisterUserInputByInvitation {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  active: boolean;
}

const createUserAndTokens = async (userInput: RegisterUserInputByInvitation) => {
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
    frontendBaseUrl: string,
  ): Promise<GenerateInvitationResponse> {
    const newUsername = await generateRandomUsername();
    const { newUser } = await createUserAndTokens({
      email,
      password: 'password@1234',
      username: newUsername,
      firstName: 'Invited',
      lastName: 'Teacher',
      active: false,
    });
    await membershipService.createMembership({
      company: new mongoose.Types.ObjectId(companyId),
      user: newUser._id as Types.ObjectId,
      role: ROLE.INSTRUCTOR,
      status: MEMBERSHIP_STATUS.INVITED,
    });
    const invitationLink = await generateInvitationLinkAndStoreToken(email, role, frontendBaseUrl);

    return {
      invitationLink,
      email,
      role,
      expiresIn: EXPIRES_TIME_CONFIG.EXPIRES_IN_DISPLAY,
    };
  }
}
