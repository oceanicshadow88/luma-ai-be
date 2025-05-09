import mongoose, { Document, Schema } from 'mongoose';
import { hashVerificationCode } from '../utils/verification';

export interface IVerification extends Document {
  email: string;
  code: string; // This will store hashed code
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

const verificationSchema = new Schema({
  email: { 
    type: String, 
    required: true,
    index: true 
  },
  code: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash code before saving
verificationSchema.pre('save', async function(next) {
  if (this.isModified('code')) {
    this.code = await hashVerificationCode(this.code);
  }
  next();
});

// Add index for cleanup
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IVerification>('Verification', verificationSchema);