import { DEFAULT_LOCALE, LOCALES, ROLE_LIST } from '@src/config/constants';
import { LocaleType, RoleType } from '@src/types/constantsTypes';
import { HttpStatusCode } from 'axios';
import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

import AppException from '../exceptions/appException';
import { jwtUtils } from '../lib/jwtUtils';

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum USER_STATUS {
  ACTIVE = 'active',
  INVITED = 'invited',
  DISABLED = 'disabled',
}

export interface User extends Document {
  firstName?: string;
  lastName?: string;
  username?: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: LocaleType;
  createdAt: Date;
  refreshToken?: string;
  loginAttempts: number;
  lockUntil?: Date;
  role: RoleType;
  status?: USER_STATUS;
  company: mongoose.Types.ObjectId;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  hashPassword(): Promise<void>;
  validatePassword(inputPassword: string): Promise<boolean>;
  generateTokens(): Promise<{ accessToken: string; refreshToken: string }>;
  hasUser(email: string, companyId: string): Promise<boolean>;
}

export interface UserModel extends Model<User> {
  refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

const userSchema: Schema<User> = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
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
    role: {
      type: String,
      enum: ROLE_LIST,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },
    status: {
      type: String,
      enum: USER_STATUS,
      required: true,
      default: USER_STATUS.DISABLED,
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
  const accessToken = jwtUtils.generateAccessToken({
    userId,
    companyId: this.company?.toString() ?? '',
  });
  const refreshToken = jwtUtils.generateRefreshToken({
    userId,
    companyId: this.company?.toString() ?? '',
  });

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
    companyId: user.company?.toString() ?? '',
  });
  const newRefreshToken = jwtUtils.generateRefreshToken({
    userId: (user._id as Types.ObjectId).toString(),
    companyId: user.company?.toString() ?? '',
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Helper function to check email uniqueness for new users
async function checkEmailUniqueness(email: string, company: mongoose.Types.ObjectId) {
  const userExists = await UserModel.exists({ email, company });
  if (userExists) {
    throw new AppException(HttpStatusCode.Conflict, 'Email already registered. Please log in.', {
      field: 'email',
    });
  }
}

// Helper function to check username uniqueness
async function checkUsernameUniqueness(
  username: string,
  company: mongoose.Types.ObjectId,
  excludeId?: mongoose.Types.ObjectId,
) {
  const query: Record<string, unknown> = { username, company };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const userExists = await UserModel.exists(query);
  if (userExists) {
    throw new AppException(
      HttpStatusCode.Conflict,
      'Username already in use. Try a different one.',
      { field: 'username' },
    );
  }
}

// Hash password before saving if it's modified
userSchema.pre('save', async function (next) {
  // Handle uniqueness checks for new users
  if (this.isNew && this.company) {
    await checkEmailUniqueness(this.email, this.company);
    if (this.username) {
      await checkUsernameUniqueness(this.username, this.company);
    }
  }

  // Handle username uniqueness for existing users when username is modified
  if (!this.isNew && this.company && this.isModified('username') && this.username) {
    await checkUsernameUniqueness(this.username, this.company, this._id as mongoose.Types.ObjectId);
  }

  // Hash password if it's been modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

// Prevent duplicate model registration in development (hot reload)
const UserModel = (mongoose.models.User || mongoose.model<User>('User', userSchema)) as UserModel;

export default UserModel;
