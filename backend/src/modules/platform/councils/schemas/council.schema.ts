import * as MongooseModule from '@nestjs/mongoose';
import { Document } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class Council extends Document {
  @MongooseModule.Prop({ required: true })
  name: string;

  @MongooseModule.Prop({ required: true, unique: true })
  domain: string; // Used to identify the tenant uniquely (e.g. for x-tenant-id)

  @MongooseModule.Prop({ default: true })
  isActive: boolean;
}

export const CouncilSchema = MongooseModule.SchemaFactory.createForClass(Council);
