import { Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export class ActivityType extends Document {
  name: string;
  color: string;
  council: Types.ObjectId;
  isActive: boolean;
}

export const ActivityTypeSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#2196f3' },
  council: { type: Schema.Types.ObjectId, ref: 'Council' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
