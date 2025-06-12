import { HttpStatusCode } from 'axios';
import UserModel, { User } from '../models/user';
import AppException from '../exceptions/appException';
import { Types } from 'mongoose';
import { LocaleType } from 'src/config';

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
  // create users
  createUser: async (userInput: UserCreateInput): Promise<User> => {
    const existingUser = await UserModel.findOne({
      $or: [{ email: userInput.email }, { username: userInput.username }],
    });
    if (existingUser) {
      throw new AppException(HttpStatusCode.Conflict, 'User email or username already exist');
    }

    const user = new UserModel(userInput);
    await user.hashPassword();
    await user.save();

    return user;
  },

  // Get user by ID
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
};
