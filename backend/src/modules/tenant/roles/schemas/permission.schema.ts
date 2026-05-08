import * as NestMongoose from '@nestjs/mongoose';
import { Document } from 'mongoose';

const { Prop, Schema, SchemaFactory } = NestMongoose;

@Schema()
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string; // e.g. MANAGE_MEMBERS, MANAGE_FINANCE

  @Prop()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
