import { EXPIRES_TIME_CONFIG, LocaleType, MEMBERSHIP_STATUS } from '@src/config';
import { generateRandomUsername } from '@src/lib/generateRandomUsername';
import { membershipService } from '@src/services/membershipService';
import { userService } from '@src/services/userService';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '@src/types/invitation';
import { generateInvitationLinkAndStoreToken } from '@src/utils/invitationLink';
import mongoose, { Types } from 'mongoose';

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
      password: '123@Password',//this is a huge security risk, should be change
      username: newUsername,
      firstName: 'Invited',
      lastName: 'Invited',
      active: false,
    });
    await membershipService.createMembership({
      company: new mongoose.Types.ObjectId(companyId),
      user: newUser._id as Types.ObjectId,
      role: role,
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
