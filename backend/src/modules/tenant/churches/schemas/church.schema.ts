import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export class Church extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export const ChurchSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
