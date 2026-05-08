import * as NestMongoose from '@nestjs/mongoose';
import { Document } from 'mongoose';

const { Prop, Schema, SchemaFactory } = NestMongoose;

@Schema({ timestamps: true })
export class Church extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ChurchSchema = SchemaFactory.createForClass(Church);
