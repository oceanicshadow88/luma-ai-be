import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User extends Document {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  locale: string;
  createdAt: Date;
  active: boolean;
  // Password reset fields
  resetCode?: string;
  resetCodeExpiry?: Date;
  resetCodeAttempts?: number;
  hashPassword(): Promise<void>;
  validatePassword(inputPassword: string): Promise<boolean>;
  validateResetCode(code: string): Promise<{
    isValid: boolean;
    message: string;
  }>;
  refreshToken?: string;
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
      enum: ['en', 'zh'],
      default: 'en',
    },
    refreshToken: {
      type: String,
      required: false,
    },
    // Password reset fields
    resetCode: {
      type: String,
    },
    resetCodeExpiry: {
      type: Date,
    },
    resetCodeAttempts: {
      type: Number,
      default: 0,
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

userSchema.methods.validateResetCode = async function (
  this: User,
  code: string,
): Promise<{ isValid: boolean; message: string }> {
  // Check if user has a valid reset code
  if (!this.resetCode || !this.resetCodeExpiry) {
    return {
      isValid: false,
      message: 'Invalid or expired code. Please request a new one.',
    };
  }

  // Check if code is expired
  if (this.resetCodeExpiry < new Date()) {
    // Clear expired code
    this.resetCode = undefined;
    this.resetCodeExpiry = undefined;
    await this.save();

    return {
      isValid: false,
      message: 'Invalid or expired code. Please request a new one.',
    };
  }

  // Increment attempt counter to prevent brute force
  this.resetCodeAttempts = (this.resetCodeAttempts || 0) + 1;

  // Check for too many attempts (5 max)
  if (this.resetCodeAttempts >= 5) {
    // Clear code after too many attempts
    this.resetCode = undefined;
    this.resetCodeExpiry = undefined;
    this.resetCodeAttempts = 0;
    await this.save();

    return {
      isValid: false,
      message: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  // Verify the code
  if (this.resetCode !== code) {
    await this.save(); // Save the incremented attempt counter

    return {
      isValid: false,
      message: 'Invalid or expired code. Please request a new one.',
    };
  }

  // If we get here, the code is valid
  return {
    isValid: true,
    message: 'Code verified successfully',
  };
};

// Prevent duplicate model registration in development (hot reload)
const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', userSchema);

export default UserModel;
