import mongoose, { Document, Schema } from 'mongoose';
import { COMPANY_PLANS, CompanyPlan, TIMEZONES, LOCALES } from '../config';
import MembershipModel from './membership';

export interface Company extends Document {
  companyName: string;
  slug: string;
  plan: CompanyPlan;
  owner: mongoose.Types.ObjectId;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  active: boolean;
}

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: COMPANY_PLANS,
      required: true,
      default: 'free',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    settings: {
      timezone: {
        type: String,
        enum: TIMEZONES,
        default: 'UTC',
      },
      locale: {
        type: String,
        enum: LOCALES,
        default: 'en-US',
      },
      logoUrl: {
        type: String,
        required: false,
        default: '',
        validate: {
          validator: function (avatarUrl: string) {
            return (
              avatarUrl === '' || /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp|svg)$/i.test(avatarUrl)
            );
          },
          message: (props: { value: unknown }) => `${props.value} is not a valid image URL`,
        },
      },
      primaryColor: {
        type: String,
        default: '#000000',
        validate: {
          validator: (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v),
          message: 'Invalid hex color code',
        },
      },
      default: {},
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  // timestamp auto createAt and updateAt
  { timestamps: true },
);

// When deleting a company, delete the relevant membership
companySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await MembershipModel.deleteMany({ user: this._id });
  next();
});

export default mongoose.model<Company>('Company', companySchema);
