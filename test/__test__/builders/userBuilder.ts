import { DEFAULT_LOCALE, LocaleType, ROLES, RoleType } from '@src/types/constants';
import type { Document } from 'mongoose';
import mongoose from 'mongoose';

import UserModel, { type User, USER_STATUS } from '../../../src/models/user';

export interface UserDocument extends Document, User {
  _id: string;
}

class UserBuilder {
  private user: Partial<User>;

  constructor() {
    this.user = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      password: '!passwordD123',
      email: 'john@example.com',
      avatarUrl: '',
      locale: DEFAULT_LOCALE,
      status: USER_STATUS.ACTIVE,
      refreshToken: undefined,
      loginAttempts: 0,
      lockUntil: undefined,
      role: ROLES.ADMIN,
    };
  }

  withFirstName(firstName: string): UserBuilder {
    this.user.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): UserBuilder {
    this.user.lastName = lastName;
    return this;
  }

  withUsername(username: string): UserBuilder {
    this.user.username = username;
    return this;
  }

  withPassword(password: string): UserBuilder {
    this.user.password = password;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  withAvatarUrl(avatarUrl: string): UserBuilder {
    this.user.avatarUrl = avatarUrl;
    return this;
  }

  withLocale(locale: LocaleType): UserBuilder {
    this.user.locale = locale;
    return this;
  }

  withStatus(status: USER_STATUS): UserBuilder {
    this.user.status = status;
    return this;
  }

  withRefreshToken(refreshToken?: string): UserBuilder {
    this.user.refreshToken = refreshToken;
    return this;
  }

  withLoginAttempts(loginAttempts: number): UserBuilder {
    this.user.loginAttempts = loginAttempts;
    return this;
  }

  withLockUntil(lockUntil?: Date): UserBuilder {
    this.user.lockUntil = lockUntil;
    return this;
  }

  withRole(role: RoleType): UserBuilder {
    this.user.role = role;
    return this;
  }

  withCompany(companyId: string): UserBuilder {
    this.user.company = new mongoose.Types.ObjectId(companyId);
    return this;
  }

  build(): Partial<User> {
    return this.user;
  }

  async save(): Promise<UserDocument> {
    const savedUser = await new UserModel(this.user).save();
    return savedUser as UserDocument;
  }
}

export default UserBuilder;
