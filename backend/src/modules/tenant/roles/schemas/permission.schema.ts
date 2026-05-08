import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string; // e.g. MANAGE_MEMBERS, MANAGE_FINANCE

  @Prop()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
