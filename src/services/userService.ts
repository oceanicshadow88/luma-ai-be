import { HttpStatusCode } from 'axios';
import UserModel, { User } from '../models/user';
import AppException from '../exceptions/appException';

export interface CreateUserInput {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl?: string;
  locale?: string;
}

export const userService = {
  // create users
  createUser: async (input: CreateUserInput): Promise<User> => {
    const { firstname, lastname, username, password, email, avatarUrl, locale } = input;
    const user = new UserModel({
      firstname,
      lastname,
      username,
      password,
      email,
      avatarUrl,
      locale,
    });
    await user.hashPassword();

    return user;
  },

  // Get all users
  getAllUsers: async (page: number, limit: number, q?: string) => {
    const query = q ? { $text: { $search: q } } : {};
    const skip = (page - 1) * limit;

    const users = await UserModel.find(query).skip(skip).limit(limit).select('-password').exec();

    if (!users.length) {
      throw new AppException(HttpStatusCode.NotFound, 'User not found');
    }
    return users;
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'User not found');
    }
    return user;
  },

  // Update user
  updateUserById: async (userId: string, updates: Partial<User>) => {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'User not found');
    }

    user.set(updates);
    await user.save();

    return user;
  },

  // Delete user
  deleteUserById: async (userId: string) => {
    // find user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppException(HttpStatusCode.NotFound, 'User not found');
    }

    return await user.deleteOne();
  },
};
