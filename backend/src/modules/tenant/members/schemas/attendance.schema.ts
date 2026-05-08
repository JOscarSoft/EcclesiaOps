import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EventType {
  SUNDAY = 'SUNDAY',
  MIDWEEK = 'MIDWEEK',
  SPECIAL = 'SPECIAL',
}

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  member: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: String, enum: EventType, default: EventType.SUNDAY })
  eventType: EventType;

  @Prop({ default: true })
  present: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Index for efficient queries
AttendanceSchema.index({ member: 1, date: -1 });
AttendanceSchema.index({ date: -1, eventType: 1 });
