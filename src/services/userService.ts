import NotFoundException from '../exceptions/notFoundException';
import UserModel, { IUser } from '../models/user';
import logger from '../utils/logger';

export const userService = {
  // Get all users
  getAllUsers: async (
    page: number,
    limit: number,
    q?: string
  ): Promise<IUser[]> => {
    const query = q ? { $text: { $search: q } } : {};
    const skip = (page - 1) * limit;
    try {
      const users = await UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .exec();

      if (!users.length) {
        throw new NotFoundException('No users found!');
      }
      return users;

    } catch (error) {
      logger.error('Error in getAllUsers:', error);
      return [];
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<IUser | null> => {
    try {
      const user = await UserModel.findById(userId).select('-password').exec();
      if (!user) {
        throw new NotFoundException(`Users not found ${userId}`);
      }

      return user;

    } catch (error) {
      logger.error(`Error fetching user with ID ${userId}:`, error);
      return null;
    }
  },

  // // Create new user
  // createUser: async (userData: Partial<IUser>): Promise<IUser> => {
  //   try {
  //     return await User.create(userData);
  //   } catch (error) {
  //     console.error('Error creating user:', error);
  //     throw error; // Re-throw to allow controller to handle appropriately
  //   }
  // },

  // // Update user
  // updateUser: async (userId: string, userData: Partial<IUser>): Promise<IUser | null> => {
  //   try {
  //     return await User.findByIdAndUpdate(userId, userData, {
  //       new: true,
  //       runValidators: true,
  //     }).select('-password');
  //   } catch (error) {
  //     console.error(`Error updating user with ID ${userId}:`, error);
  //     return null;
  //   }
  // },

  // // Delete user
  // deleteUser: async (userId: string): Promise<IUser | null> => {
  //   try {
  //     return await User.findByIdAndDelete(userId);
  //   } catch (error) {
  //     console.error(`Error deleting user with ID ${userId}:`, error);
  //     return null;
  //   }
  // },
};
