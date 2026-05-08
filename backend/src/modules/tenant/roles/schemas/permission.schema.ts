import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string; // e.g., 'CREATE_MEMBER', 'DELETE_FINANCE'

  @Prop()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
