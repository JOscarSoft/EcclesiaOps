import * as MongooseModule from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class Role extends Document {
  @MongooseModule.Prop({ required: true })
  name: string; // e.g. ADMIN, SECRETARY, TREASURER

  @MongooseModule.Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions: Types.ObjectId[];
}

export const RoleSchema = MongooseModule.SchemaFactory.createForClass(Role);
