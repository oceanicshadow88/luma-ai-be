import mongoose, { Document, Schema } from 'mongoose';

import {
  DEFAULT_MEMBERSHIP_STATUS,
  MEMBERSHIP_STATUS,
  MembershipStatusType,
  roleList,
  RoleType,
} from '../config';

export interface Membership extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: RoleType;
  status: MembershipStatusType;
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
    status: {
      type: String,
      enum: MEMBERSHIP_STATUS,
      default: DEFAULT_MEMBERSHIP_STATUS,
    },
  },
  // timestamp auto createAt and updateAt
  { timestamps: true },
);

const MembershipModel = mongoose.model<Membership>('Membership', membershipSchema);

export default MembershipModel;
