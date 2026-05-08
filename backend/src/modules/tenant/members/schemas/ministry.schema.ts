import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Ministry extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Member' })
  leader: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const MinistrySchema = SchemaFactory.createForClass(Ministry);
