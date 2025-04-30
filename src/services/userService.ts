import User, { IUser } from '../models/User';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<IUser[]> => {
    return await User.find().select('-password');
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<IUser | null> => {
    return await User.findById(userId).select('-password');
  },

  // Create new user
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    return await User.create(userData);
  },

  // Update user
  updateUser: async (
    userId: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> => {
    return await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    }).select('-password');
  },

  // Delete user
  deleteUser: async (userId: string): Promise<IUser | null> => {
    return await User.findByIdAndDelete(userId);
  },
};
