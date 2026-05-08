import * as NestMongoose from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const { Prop, Schema, SchemaFactory } = NestMongoose;

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true })
  name: string; // e.g. ADMIN, SECRETARY, TREASURER

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
