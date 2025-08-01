import AppException from '@src/exceptions/appException';
import UserModel from '@src/models/user';
import { HttpStatusCode } from 'axios';
export const userSeeder = {
  async seedDefault() {
    try {
      const existing = await UserModel.findOne({ email: 'test@test.com' });
      if (existing) {
        return existing;
      }

      const newUser = await UserModel.create({
        username: 'defaultAdmin',
        firstName: 'admin',
        lastName: 'admin',
        email: 'test@test.com',
        password: '123@Password',
        role: 'admin',
      });
      return newUser;
    } catch (err) {
      if (err instanceof Error) {
        throw new AppException(
          HttpStatusCode.InternalServerError,
          '❌ Error seeding user: ' + err.message,
        );
      }
      throw new AppException(HttpStatusCode.InternalServerError, '❌ Unknown error seeding user');
    }
  },
};
