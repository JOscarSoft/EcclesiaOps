import * as MongooseModule from '@nestjs/mongoose';
import { Document } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class Church extends Document {
  @MongooseModule.Prop({ required: true })
  name: string;

  @MongooseModule.Prop()
  address: string;

  @MongooseModule.Prop()
  phone: string;

  @MongooseModule.Prop()
  email: string;

  @MongooseModule.Prop({ default: true })
  isActive: boolean;
}

export const ChurchSchema = MongooseModule.SchemaFactory.createForClass(Church);
