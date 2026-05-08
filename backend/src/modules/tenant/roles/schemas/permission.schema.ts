import * as MongooseModule from '@nestjs/mongoose';
import { Document } from 'mongoose';

@MongooseModule.Schema()
export class Permission extends Document {
  @MongooseModule.Prop({ required: true, unique: true })
  name: string; // e.g. MANAGE_MEMBERS, MANAGE_FINANCE

  @MongooseModule.Prop()
  description: string;
}

export const PermissionSchema = MongooseModule.SchemaFactory.createForClass(Permission);
