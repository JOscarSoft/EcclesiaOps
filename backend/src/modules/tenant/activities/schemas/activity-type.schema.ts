import * as NestMongoose from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const { Prop, Schema, SchemaFactory } = NestMongoose;

@Schema({ timestamps: true })
export class ActivityType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '#2196f3' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'Council' })
  council: Types.ObjectId;
}

export const ActivityTypeSchema = SchemaFactory.createForClass(ActivityType);
