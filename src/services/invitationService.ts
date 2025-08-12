import AppException from '@src/exceptions/appException';
import UserModel, { USER_STATUS } from '@src/models/user';
import { userService } from '@src/services/userService';
import { EXPIRES_TIME_CONFIG, LocaleType, RoleType } from '@src/types/constants';
import { GenerateInvitationRequest, GenerateInvitationResponse } from '@src/types/invitation';
import { generateInvitationLinkAndStoreToken } from '@src/utils/invitationLink';
import { HttpStatusCode } from 'axios';
import mongoose, { Types } from 'mongoose';

export interface RegisterUserInputByInvitation {
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
  company: Types.ObjectId;
  role: RoleType;
  status?: USER_STATUS;
}

const createUserAndTokens = async (userInput: RegisterUserInputByInvitation, companyId: string) => {
  const newUser = await userService.createUser({ ...userInput, company: companyId });
  // Generate authentication tokens
  const { refreshToken, accessToken } = await newUser.generateTokens();
  await userService.updateUserById(newUser.id, { refreshToken });

  return { newUser, refreshToken, accessToken };
};

export class InvitationService {
  static async generateInvitationNew(
    { email, role }: GenerateInvitationRequest,
    companyId: string,
    frontendBaseUrl: string,
  ): Promise<GenerateInvitationResponse> {
    const userExists = await UserModel.findOne({ email, company: companyId });
    if (!userExists) {
      const { newUser } = await createUserAndTokens(
        {
          email,
          password: '123@Password', //TODO: this is a huge security risk, should be change
          company: new mongoose.Types.ObjectId(companyId),
          role: role,
          status: USER_STATUS.INVITED,
        },
        companyId,
      );

      const invitationLink = await generateInvitationLinkAndStoreToken(
        email,
        role,
        frontendBaseUrl,
        newUser?.id ?? '',
        companyId,
      );

      return {
        invitationLink,
        email,
        role,
        expiresIn: EXPIRES_TIME_CONFIG.EXPIRES_IN_DISPLAY,
      };
    }

    if (userExists.status === USER_STATUS.ACTIVE || userExists.status === USER_STATUS.INVITED) {
      throw new AppException(HttpStatusCode.Conflict, 'User exists');
    }
    if (userExists.status === USER_STATUS.DISABLED) {
      throw new AppException(HttpStatusCode.Conflict, 'User disabled');
    }

    const invitationLink = await generateInvitationLinkAndStoreToken(
      email,
      role,
      frontendBaseUrl,
      userExists.id ?? '',
      companyId,
      userExists.status ?? USER_STATUS.INVITED,
    );
    return {
      invitationLink,
      email,
      role,
      expiresIn: EXPIRES_TIME_CONFIG.EXPIRES_IN_DISPLAY,
    };
  }
}
