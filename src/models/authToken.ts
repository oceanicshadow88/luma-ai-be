import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

const authTokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenHash: {
    type: String,
    required: true,
    index: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revokedAt: {
    type: Date
  }
});

export default mongoose.model<IAuthToken>('AuthToken', authTokenSchema); 