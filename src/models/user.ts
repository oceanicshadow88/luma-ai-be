import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { validate } from '../../node_modules/@types/json-schema/index.d';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: string;
  createdAt: Date;
  active: boolean;
  hashPassword(): Promise<void>;
  validatePassword(inputPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
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
      minlength: 6,
      maxlength: 20,
      validate: {
        validator: (password: string) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/.test(password),
        message: () => 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) =>
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
        message: props => `${props.value} is not a valid email address`,
      },
    },
    avatarUrl: {
      type: String,
      required: false,
      default: '',
      validate: {
        validator: (avatarUrl: string) =>
          /^(https?:\/\/[^\s/$.?#].[^\s]*\.(?:png|jpg|jpeg|gif|svg))$/i.test(avatarUrl),
        message: props => `${props.value} is not a valid image URL`,
      },
    },
    locale: {
      type: String,
      required: false,
      enum: ['en', 'zh'],
      default: 'en',
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

// use this: no arrow function
userSchema.methods.hashPassword = async function (this: IUser): Promise<void> {
  this.password = await bcrypt.hash(this.password, 12);
};

userSchema.methods.validatePassword = async function (
  this: IUser,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Prevent duplicate model registration in development (hot reload)
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default UserModel;
