/// <reference types="jest" />

import type { Document } from 'mongoose';

import { DEFAULT_LOCALE } from '../../../src/config';
import UserModel from '../../../src/models/user';

export interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: string;
  active: boolean;
  refreshToken?: string;
  loginAttempts: number;
  lockUntil?: Date | null;
}

export interface UserDocument extends Document, UserData {
  _id: string;
}

class UserBuilder {
  private user: UserData;

  constructor() {
    this.user = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      password: '!passwordD123',
      email: 'john@example.com',
      avatarUrl: '',
      locale: DEFAULT_LOCALE,
      active: true,
      refreshToken: undefined,
      loginAttempts: 0,
      lockUntil: null,
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

  withLocale(locale: string): UserBuilder {
    this.user.locale = locale;
    return this;
  }

  withActive(active: boolean): UserBuilder {
    this.user.active = active;
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

  withLockUntil(lockUntil?: Date | null): UserBuilder {
    this.user.lockUntil = lockUntil;
    return this;
  }

  build(): UserData {
    return this.user;
  }

  async save(): Promise<UserDocument> {
    const savedUser = await new UserModel(this.user).save();
    return savedUser as UserDocument;
  }
}

export default UserBuilder;
