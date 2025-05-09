import mongoose, { Document, Schema } from 'mongoose';

export interface IInvite extends Document {
  companyId: mongoose.Types.ObjectId;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
}

const inviteSchema = new Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: {
    type: Date
  }
});

export default mongoose.model<IInvite>('Invite', inviteSchema); 