import * as MongooseModule from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class ActivityType extends Document {
  @MongooseModule.Prop({ required: true })
  name: string;

  @MongooseModule.Prop({ default: '#2196f3' })
  color: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Council' })
  council: Types.ObjectId;

  @MongooseModule.Prop({ default: true })
  isActive: boolean;
}

export const ActivityTypeSchema = MongooseModule.SchemaFactory.createForClass(ActivityType);
