import * as MongooseModule from '@nestjs/mongoose';
import { Document } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class PlatformUser extends Document {
  @MongooseModule.Prop({ required: true, unique: true })
  email: string;

  @MongooseModule.Prop({ required: true })
  passwordHash: string;

  @MongooseModule.Prop({ required: true })
  name: string;
}

export const PlatformUserSchema = MongooseModule.SchemaFactory.createForClass(PlatformUser);
