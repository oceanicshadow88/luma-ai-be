import { HttpStatusCode } from 'axios';
import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

import { DEFAULT_LOCALE, LOCALES, LocaleType } from '../config';
import AppException from '../exceptions/appException';
import { jwtUtils } from '../lib/jwtUtils';
import MembershipModel from './membership';

export interface User extends Document {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: LocaleType;
  createdAt: Date;
  active: boolean;
  refreshToken?: string;
  loginAttempts: number;
  lockUntil?: Date;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  hashPassword(): Promise<void>;
  validatePassword(inputPassword: string): Promise<boolean>;
  generateTokens(): Promise<{ accessToken: string; refreshToken: string }>;
}

export interface UserModel extends Model<User> {
  refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

const userSchema: Schema<User> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
      validate: {
        validator: (username: string) => {
          // validation logic
          return /^[a-zA-Z0-9._-]+$/.test(username);
        },
        message: props => `${props.value} is not a valid username`,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
        message: props => `${props.value} is not a valid email address`,
      },
    },
    avatarUrl: {
      type: String,
      required: false,
      default: '',
      validate: {
        validator: function (avatarUrl: string) {
          return (
            avatarUrl === '' || /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp|svg)$/i.test(avatarUrl)
          );
        },
        message: props => `${props.value} is not a valid image URL`,
      },
    },
    locale: {
      type: String,
      required: false,
      enum: LOCALES,
      default: DEFAULT_LOCALE,
    },
    active: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.methods.validatePassword = async function (
  this: User,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// locked when too many attempts
userSchema.methods.isLocked = function () {
  return !!this.lockUntil && this.lockUntil > new Date();
};

userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 5 * 60 * 1000; // 10 min

  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME);
    }
  }
  await this.save();
};

// token method
userSchema.methods.generateTokens = async function (
  this: User,
): Promise<{ accessToken: string; refreshToken: string }> {
  const userId = (this._id as Types.ObjectId).toString();
  const accessToken = jwtUtils.generateAccessToken({ userId });
  const refreshToken = jwtUtils.generateRefreshToken({ userId });

  return { accessToken, refreshToken };
};

userSchema.statics.refreshAuthToken = async function (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = jwtUtils.verifyRefreshToken(refreshToken);

  const user = await this.findOne({ _id: payload.userId, refreshToken });
  if (!user) {
    throw new AppException(HttpStatusCode.Unauthorized, 'Invalid refresh token');
  }

  const newAccessToken = jwtUtils.generateAccessToken({
    userId: (user._id as Types.ObjectId).toString(),
  });
  const newRefreshToken = jwtUtils.generateRefreshToken({
    userId: (user._id as Types.ObjectId).toString(),
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Hash password before saving if it's modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// When deleting a user, delete the relevant membership
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await MembershipModel.deleteMany({ user: this._id });
  next();
});

// Prevent duplicate model registration in development (hot reload)
const UserModel = (mongoose.models.User || mongoose.model<User>('User', userSchema)) as UserModel;

export default UserModel;
