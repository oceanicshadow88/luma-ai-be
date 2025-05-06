import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  plan: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  settings: {
    timezone: string;
    locale: string;
    logoUrl: string;
    primaryColor: string;
  };
}

const companySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, required: true, default: 'free' },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  settings: {
    timezone: { type: String, default: 'UTC' },
    locale: { type: String, default: 'en-US' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#000000' },
  },
});

export default mongoose.model<ICompany>('Company', companySchema);
