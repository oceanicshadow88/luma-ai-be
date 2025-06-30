import bcrypt from 'bcryptjs';

import UserModel from '../../models/user';
export const userSeeder = {
  async seedDefault() {
    try {
      const existing = await UserModel.findOne({ email: 'test@test.com' });
      if (existing) {
        return existing;
      }

      const hashedPassword = await bcrypt.hash('password123', 10);

      const newUser = await UserModel.create({
        username: 'defaultAdmin',
        firstName: 'admin',
        lastName: 'admin',
        email: 'test@test.com',
        password: hashedPassword,
      });
      return newUser;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error('❌ Error seeding user: ' + err.message);
      }
      throw new Error('❌ Unknown error seeding user');
    }
  },
};
