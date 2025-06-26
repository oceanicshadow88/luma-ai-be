import mongoose, { Document, Schema } from 'mongoose';

import {
  COMPANY_PLANS,
  CompanyPlanType,
  DEFAULT_COMPANY_PLAN,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  LOCALES,
  LocaleType,
  TIMEZONES,
} from '../config';
import MembershipModel from './membership';

export interface Company extends Document {
  companyName: string;
  slug: string;
  plan?: CompanyPlanType;
  owner: mongoose.Types.ObjectId;
  logoUrl?: string;
  settings?: {
    timezone?: string;
    locale?: LocaleType;
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
      default: DEFAULT_COMPANY_PLAN,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    logoUrl: {
      type: String,
      required: false,
      default: '',
    },
    settings: {
      timezone: {
        type: String,
        enum: TIMEZONES,
        default: DEFAULT_TIMEZONE,
      },
      locale: {
        type: String,
        enum: LOCALES,
        default: DEFAULT_LOCALE,
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
  await MembershipModel.deleteMany({ company: this._id });
  next();
});

const CompanyModel = mongoose.model<Company>('Company', companySchema);
export default CompanyModel;
