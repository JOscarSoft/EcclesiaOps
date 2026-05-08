import { Prop, Schema } from '@nestjs/mongoose/dist/decorators';
import { SchemaFactory } from '@nestjs/mongoose/dist/factories';
import { Document } from 'mongoose';

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
