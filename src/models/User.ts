import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: string;
  createdAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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
  },
  { timestamps: true },
);

// Prevent duplicate model registration in development (hot reload)
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default UserModel;
