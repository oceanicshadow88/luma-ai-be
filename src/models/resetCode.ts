import mongoose, { Document, Model, Schema } from 'mongoose';

import config from '../config';
import { VerifyCodeType } from '../types/invitation';

export interface ResetCode extends Document {
  email: string;
  code: string;
  verifyType: VerifyCodeType; // Use enum instead of union type
  expiresAt: Date;
  attempts: number;
  validateResetCode(code: string): Promise<{
    isValid: boolean;
    message: string;
  }>;
}

const resetCodeSchema: Schema<ResetCode> = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    verifyType: {
      type: String,
      required: true,
      enum: Object.values(VerifyCodeType),
      default: VerifyCodeType.VERIFICATION,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: config.resetCodeExpiry, // TTL index to automatically delete expired documents
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

resetCodeSchema.methods.validateResetCode = async function (
  this: ResetCode,
  code: string,
): Promise<{ isValid: boolean; message: string }> {
  // Check if code is expired
  if (this.expiresAt < new Date()) {
    // No need to delete, MongoDB TTL will handle this
    return {
      isValid: false,
      message: 'Invalid or expired code. Please request a new one.',
    };
  }

  // Increment attempt counter to prevent brute force
  this.attempts = this.attempts + 1;

  // Check for too many attempts (5 max)
  if (this.attempts >= 5) {
    // Delete the code after too many attempts
    await this.deleteOne();

    return {
      isValid: false,
      message: 'Too many incorrect attempts. Please request a new verification value.',
    };
  }

  // Verify the code
  if (this.code !== code) {
    await this.save(); // Save the incremented attempt counter

    return {
      isValid: false,
      message: 'Invalid verifyValue. Please try again.',
    };
  }

  // If we get here, the code is valid
  return {
    isValid: true,
    message: 'Code verified successfully',
  };
};

// Prevent duplicate model registration in development (hot reload)
const ResetCodeModel: Model<ResetCode> =
  mongoose.models.ResetCode || mongoose.model<ResetCode>('ResetCode', resetCodeSchema);

export default ResetCodeModel;
