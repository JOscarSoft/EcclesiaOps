import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '#2196f3' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'Council' })
  council: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ActivityTypeSchema = SchemaFactory.createForClass(ActivityType);
