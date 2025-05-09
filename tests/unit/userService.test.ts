import { userService } from '../../src/services/userService';
import user from '../../src/models/user';

// Mock the User model
jest.mock('../../src/models/User');

describe('User Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        { _id: '1', name: 'Test User 1', email: 'test1@example.com' },
        { _id: '2', name: 'Test User 2', email: 'test2@example.com' },
      ];

      (user.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(user.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should handle errors and return empty array', async () => {
      // Arrange
      (user.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(user.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const userId = '12345';
      const mockUser = { _id: userId, name: 'Test User', email: 'test@example.com' };

      (user.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(user.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const userId = 'nonexistent';

      (user.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(user.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const userData = { name: 'New User', email: 'new@example.com', password: 'password123' };
      const mockUser = { _id: '123', ...userData };

      (user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(user.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });
});
