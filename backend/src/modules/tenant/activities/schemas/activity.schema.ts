import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ActivityType' })
  activityType: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Church', required: false })
  church: any; // Si es null, es una actividad conciliar

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  organizer: any;

  @Prop({ default: true })
  isActive: boolean;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
