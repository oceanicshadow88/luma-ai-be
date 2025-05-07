import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

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
      validate: {
        validator: username => {
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
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatarUrl: {
      type: String,
    },
    locale: {
      type: String,
      required: true,
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
