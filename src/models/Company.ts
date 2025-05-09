import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  plan: string;
  ownerId: mongoose.Types.ObjectId;
  settings: {
    timezone: string;
    locale: string;
    logoUrl: string;
    primaryColor: string;
  };
  createdAt: Date;
  active: boolean;
}

const companySchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  plan: { 
    type: String, 
    required: true, 
    default: 'free' 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  settings: {
    timezone: { 
      type: String, 
      default: 'UTC' 
    },
    locale: { 
      type: String, 
      default: 'en-US' 
    },
    logoUrl: { 
      type: String, 
      default: '' 
    },
    primaryColor: { 
      type: String, 
      default: '#000000' 
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
});

export default mongoose.model<ICompany>('Company', companySchema);
