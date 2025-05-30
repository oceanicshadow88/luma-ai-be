import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import MembershipModel from './membership';
import { jwtUtils } from '../lib/jwtUtils';
import AppException from '../exceptions/appException';
import { HttpStatusCode } from 'axios';
import { DEFAULT_LOCALE, LOCALES, LocaleType } from '../config';

export interface User extends Document {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: LocaleType;
  createdAt: Date;
  active: boolean;
  refreshToken?: string;
  hashPassword(): Promise<void>;
  validatePassword(inputPassword: string): Promise<boolean>;
  generateTokens(): Promise<{ accessToken: string; refreshToken: string }>;
}

export interface UserModel extends Model<User> {
  refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

const userSchema: Schema<User> = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
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
    refreshToken: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

// use this: no arrow function
userSchema.methods.hashPassword = async function (this: User): Promise<void> {
  this.password = await bcrypt.hash(this.password, 12);
};

userSchema.methods.validatePassword = async function (
  this: User,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateTokens = async function (
  this: User,
): Promise<{ accessToken: string; refreshToken: string }> {
  const userId = (this._id as Types.ObjectId).toString();
  const accessToken = jwtUtils.generateAccessToken({ user: userId });
  const refreshToken = jwtUtils.generateRefreshToken({ user: userId });

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
    user: (user._id as Types.ObjectId).toString(),
  });
  const newRefreshToken = jwtUtils.generateRefreshToken({
    user: (user._id as Types.ObjectId).toString(),
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// When deleting a user, delete the relevant membership
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await MembershipModel.deleteMany({ user: this._id });
  next();
});

// Prevent duplicate model registration in development (hot reload)
const UserModel = (mongoose.models.User || mongoose.model<User>('User', userSchema)) as UserModel;

export default UserModel;
