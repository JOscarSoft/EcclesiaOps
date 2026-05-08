import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export class Council extends Document {
  name: string;
  domain: string;
  isActive: boolean;
}

export const CouncilSchema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
