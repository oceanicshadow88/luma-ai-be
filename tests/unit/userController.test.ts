import { Request, Response } from 'express';
import { userController } from '../../src/controllers/userController';
import { userService } from '../../src/services/userService';
import { AppError } from '../../src/error/AppError';

// Mock dependencies
jest.mock('../../src/services/userService');

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up mock request, response, and next function
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('getAllUsers', () => {
    it('should return all users with 200 status code', async () => {
      // Arrange
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' },
      ];

      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockUsers,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Service error');
      (userService.getAllUsers as jest.Mock).mockRejectedValue(error);

      // Act
      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID with 200 status code', async () => {
      // Arrange
      const userId = '12345';
      const mockUser = { _id: userId, name: 'Test User', email: 'test@example.com' };

      mockRequest.params = { id: userId };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should call next with 404 error when user not found', async () => {
      // Arrange
      const userId = '12345';
      mockRequest.params = { id: userId };
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      // Act
      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();

      // Verify the error passed to next is a 404 AppError
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });
  });
});
