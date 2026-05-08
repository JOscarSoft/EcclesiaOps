import * as MongooseModule from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class Activity extends Document {
  @MongooseModule.Prop({ required: true })
  title: string;

  @MongooseModule.Prop()
  description: string;

  @MongooseModule.Prop({ required: true })
  startDate: Date;

  @MongooseModule.Prop({ required: true })
  endDate: Date;

  @MongooseModule.Prop()
  location: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'ActivityType', required: true })
  activityType: Types.ObjectId;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId; // Si es null, es un evento de concilio

  @MongooseModule.Prop({ default: true })
  isActive: boolean;
}

export const ActivitySchema = MongooseModule.SchemaFactory.createForClass(Activity);
