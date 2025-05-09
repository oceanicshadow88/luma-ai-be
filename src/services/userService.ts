import User, { IUser } from '../models/user';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<IUser[]> => {
    try {
      return await User.find().select('-password');
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<IUser | null> => {
    try {
      return await User.findById(userId).select('-password');
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      return null;
    }
  },

  // Create new user
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    try {
      return await User.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to allow controller to handle appropriately
    }
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<IUser>): Promise<IUser | null> => {
    try {
      return await User.findByIdAndUpdate(userId, userData, {
        new: true,
        runValidators: true,
      }).select('-password');
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      return null;
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<IUser | null> => {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      return null;
    }
  },
};
