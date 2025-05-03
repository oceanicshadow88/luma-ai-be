import request from 'supertest';
import mongoose from 'mongoose';
import User from '@src/app/models/User';
import app from '@src/loaders/app';

describe('User API Endpoints', () => {
  let userId: string;

  // Set up test data before all tests
  beforeAll(async () => {
    // Create a test user
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: 'password123',
    };

    const testUser = await User.create(userData);
    // Safely access _id by treating it as a mongoose document
    userId = testUser._id ? testUser._id.toString() : '';

    if (!userId) {
      throw new Error('Failed to create test user');
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up any test data
    await User.deleteMany({});
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id', userId);
      expect(response.body.data).toHaveProperty('name', 'Integration Test User');
      expect(response.body.data).toHaveProperty('email', 'integration@test.com');
    });

    it('should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      // Verify error response
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'New Test User',
        email: 'new.test@example.com',
        password: 'newpassword123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('email', newUser.email);

      // Verify the user was actually created in the database
      const createdUser = await User.findOne({ email: newUser.email });
      expect(createdUser).not.toBeNull();
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUser = {
        name: 'Invalid User',
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      // Verify error response
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('email');
    });
  });
});
