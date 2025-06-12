import { HttpStatusCode } from 'axios';
import UserModel, { User } from '../models/user';
import AppException from '../exceptions/appException';
import { Types } from 'mongoose';
import { LocaleType } from 'src/config';
import { Company } from '../models/company';
import MembershipModel from '../models/membership';

export interface UserCreateInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
}

export const userService = {
  checkUserExist: async (email: string, username: string) => {
    const userExistWithEmail = await UserModel.findOne({ email });
    if (userExistWithEmail) {
      throw new AppException(HttpStatusCode.Conflict, 'Email already exist');
    }
    const userExistWithUsername = await UserModel.findOne({ username });
    if (userExistWithUsername) {
      throw new AppException(HttpStatusCode.Conflict, 'Username already exist');
    }
  },
  createUser: async (userInput: UserCreateInput): Promise<User> => {
    await userService.checkUserExist(userInput.email, userInput.username);

    const user = new UserModel(userInput);
    await user.hashPassword();
    await user.save();

    return user;
  },

  getUserById: async (userId: string): Promise<User> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(HttpStatusCode.BadRequest, 'Invalid user ID');
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'User not found');
    }

    return user;
  },

  updateUserById: async (userId: string, updates: Partial<User>): Promise<User> => {
    const user = await userService.getUserById(userId);
    user.set(updates);
    await user.save();
    return user;
  },

  deleteUserById: async (userId: string) => {
    const user = await userService.getUserById(userId);
    return await user.deleteOne(); //Trigger pre deleteOne hook, also delete membership
  },

  getCurrentUserInfo: async (userId: string) => {
    const user = await userService.getUserById(userId);

    const membership = await MembershipModel.findOne({
      user: user._id,
    })
      .populate<{ company: Company }>('company')
      .lean();
    if (!membership?.company) {
      throw new AppException(HttpStatusCode.NotFound, 'Membership or organisation not found');
    }

    return {
      userId: (user._id as Types.ObjectId).toString(),
      username: user.username,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      role: membership.role,
      enterprise: membership.company,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
    };
  },
};
