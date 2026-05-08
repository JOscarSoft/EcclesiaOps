import { Prop, Schema } from '@nestjs/mongoose/dist/decorators';
import { SchemaFactory } from '@nestjs/mongoose/dist/factories';
import { Document } from 'mongoose';

@Schema()
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string; // e.g. MANAGE_MEMBERS, MANAGE_FINANCE

  @Prop()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
