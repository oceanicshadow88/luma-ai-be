import mongoose, { Document, Schema } from 'mongoose';

export interface CompanyUsageDocument extends Document {
  company: mongoose.Types.ObjectId;
  currentLearners: number;
  currentInstructors: number;
}

const CompanyUsageSchema = new Schema<CompanyUsageDocument>(
  {
    company: { type: Schema.Types.ObjectId, required: true, ref: 'Company' },
    currentLearners: { type: Number, required: true },
    currentInstructors: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<CompanyUsageDocument>('CompanyUsage', CompanyUsageSchema);
