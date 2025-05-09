import mongoose, { Document, Schema } from 'mongoose';

export interface IMembership extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'admin' | 'instructor' | 'student';
  status: 'invited' | 'active' | 'disabled';
  joinedAt: Date;
}

const membershipSchema = new Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['admin', 'instructor', 'student'],
    required: true,
  },
  status: {
    type: String,
    enum: ['invited', 'active', 'disabled'],
    default: 'active',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMembership>('Membership', membershipSchema);
