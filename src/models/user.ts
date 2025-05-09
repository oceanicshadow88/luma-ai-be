import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: string;
  refreshToken?: string;
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
      enum: ['en', 'zh'],
      default: 'en',
    },
    refreshToken: {
      type: String,
      required: false,
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
