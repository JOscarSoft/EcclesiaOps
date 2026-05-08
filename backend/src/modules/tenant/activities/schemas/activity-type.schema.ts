import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  color: string; // Para identificar en el calendario

  @Prop({ default: true })
  isActive: boolean;
}

export const ActivityTypeSchema = SchemaFactory.createForClass(ActivityType);
