import { LocaleType } from '@src/config';
import AppException from '@src/exceptions/appException';
import { Company } from '@src/models/company';
import Membership from '@src/models/membership';
import UserModel, { User } from '@src/models/user';
import { HttpStatusCode } from 'axios';
import { Types } from 'mongoose';

export interface UserCreateInput {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: LocaleType;
}

export const userService = {
  checkUserConflict: async (email: string, username: string): Promise<void> => {
    const userExistWithEmail = await UserModel.findOne({ email });
    if (userExistWithEmail) {
      // user and company all exist
      throw new AppException(HttpStatusCode.Conflict, 'Email already registered. Please log in.', {
        field: 'email',
      });
    }

    const userExistWithUsername = await UserModel.findOne({ username });
    if (userExistWithUsername) {
      throw new AppException(
        HttpStatusCode.Conflict,
        'Username already in use. Try a different one.',
        { field: 'username' },
      );
    }
  },

  // create users
  createUser: async (userInput: UserCreateInput): Promise<User> => {
    await userService.checkUserConflict(userInput.email, userInput.username);

    const user = new UserModel(userInput);
    await user.save();

    return user;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Invalid user ID');
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppException(HttpStatusCode.InternalServerError, 'User not found');
    }

    return user;
  },

  // Update user
  updateUserById: async (userId: string, updates: Partial<User>): Promise<User> => {
    const user = await userService.getUserById(userId);
    user.set(updates);
    await user.save();
    return user;
  },

  // Delete user
  deleteUserById: async (userId: string) => {
    const user = await userService.getUserById(userId);
    return await user.deleteOne(); //Trigger pre deleteOne hook, also delete membership
  },

  getCurrentUserInfo: async (userId: string, companyId: string) => {
    const membership = await Membership.findOne({
      user: userId,
      company: companyId,
    })
      .populate<{ company: Company; user: User }>('company user')
      .lean();

    if (!membership?.company || !membership?.user) {
      throw new AppException(HttpStatusCode.InternalServerError, 'Invalid Membership');
    }

    return {
      userId: (membership.user._id as Types.ObjectId).toString(),
      username: membership.user.username,
      name: `${membership.user.firstName} ${membership.user.lastName}`,
      email: membership.user.email,
      role: membership.role,
      company: membership.company,
      avatarUrl: membership.user.avatarUrl,
      locale: membership.user.locale,
    };
  },
};
