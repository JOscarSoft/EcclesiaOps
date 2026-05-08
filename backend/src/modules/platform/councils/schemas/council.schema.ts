import { Prop, Schema } from '@nestjs/mongoose/dist/decorators';
import { SchemaFactory } from '@nestjs/mongoose/dist/factories';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Council extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  domain: string; // Used to identify the tenant uniquely (e.g. for x-tenant-id)

  @Prop({ default: true })
  isActive: boolean;
}

export const CouncilSchema = SchemaFactory.createForClass(Council);
