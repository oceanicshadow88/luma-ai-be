import { generateInvitationLink } from '../utils/invitationLink';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '../types/invitation';
import { EXPIRES_TIME_CONFIG, MEMBERSHIP_STATUS, ROLE } from '../config';
import { RegisterUserInput } from '../controllers/auth/registerController';
import { userService } from './userService';
import { membershipService } from './membershipService';

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
    companyId: any,
  ): Promise<GenerateInvitationResponse> {
    const { newUser } = await createUserAndTokens({
      email,
      password: 'any',
      username: 'teacher5',
      firstName: 'teacher',
      lastName: 'teacher',
      verifyValue: '66666',
    });
    await membershipService.createMembership({
      company: companyId,
      user: newUser._id as any,
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
