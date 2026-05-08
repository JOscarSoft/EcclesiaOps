import * as NestMongoose from '@nestjs/mongoose';
import { Document } from 'mongoose';

const { Prop, Schema, SchemaFactory } = NestMongoose;

@Schema({ timestamps: true })
export class PlatformUser extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;
}

export const PlatformUserSchema = SchemaFactory.createForClass(PlatformUser);
