import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export class Council extends Document {
  name: string;
  domain: string;
  phone: string;
  address: string;
  contactName: string;
  email: string;
  isActive: boolean;
}

export const CouncilSchema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  contactName: { type: String },
  email: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
