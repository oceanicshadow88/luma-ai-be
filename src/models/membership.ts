import mongoose, { Document, Schema } from 'mongoose';
import { RoleType, roleList } from '../config';

export interface Membership extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: RoleType;
  active: boolean;
}

const membershipSchema = new Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: roleList,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  // timestamp auto createAt and updateAt
  { timestamps: true },
);

membershipSchema.index({ user: 1, company: 1, role: 1 }, { unique: true });

export default mongoose.model<Membership>('Membership', membershipSchema);
