import { Prop, Schema } from '@nestjs/mongoose/dist/decorators';
import { SchemaFactory } from '@nestjs/mongoose/dist/factories';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'ActivityType', required: true })
  activityType: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId; // Si es null, es un evento de concilio

  @Prop({ default: true })
  isActive: boolean;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
