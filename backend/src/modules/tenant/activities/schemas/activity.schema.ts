import { Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export class Activity extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  activityType: Types.ObjectId;
  church: Types.ObjectId;
  isActive: boolean;
}

export const ActivitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String },
  activityType: { type: Schema.Types.ObjectId, ref: 'ActivityType', required: true },
  church: { type: Schema.Types.ObjectId, ref: 'Church' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
