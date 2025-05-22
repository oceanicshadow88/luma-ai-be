import mongoose, { Document, Schema } from 'mongoose';

export interface Membership extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'admin' | 'instructor' | 'student';
  status: 'invited' | 'active' | 'disabled';
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
},
  // timestamp auto createAt and updateAt
  { timestamps: true },
);

export default mongoose.model<Membership>('Membership', membershipSchema);
