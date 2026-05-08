import * as MongooseModule from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class User extends Document {
  @MongooseModule.Prop({ required: true })
  firstName: string;

  @MongooseModule.Prop({ required: true })
  lastName: string;

  @MongooseModule.Prop({ required: true, unique: true })
  email: string;

  @MongooseModule.Prop({ required: true })
  passwordHash: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId; // Si es null, es usuario de concilio

  @MongooseModule.Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = MongooseModule.SchemaFactory.createForClass(User);
