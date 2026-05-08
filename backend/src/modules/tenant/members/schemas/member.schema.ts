import * as MongooseModule from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VISITOR = 'VISITOR',
}

@MongooseModule.Schema({ timestamps: true, collection: 'members' })
export class Member extends Document {
  @MongooseModule.Prop({ required: true })
  firstName: string;

  @MongooseModule.Prop({ required: true })
  lastName: string;

  @MongooseModule.Prop()
  birthDate: Date;

  @MongooseModule.Prop({ type: String, enum: Gender })
  gender: Gender;

  @MongooseModule.Prop({ type: String, enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @MongooseModule.Prop({ default: false })
  baptized: boolean;

  @MongooseModule.Prop()
  baptismDate: Date;

  @MongooseModule.Prop()
  joinDate: Date;

  @MongooseModule.Prop()
  phone: string;

  @MongooseModule.Prop()
  email: string;

  @MongooseModule.Prop()
  address: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId;

  @MongooseModule.Prop({ type: [{ type: Types.ObjectId, ref: 'Ministry' }], default: [] })
  ministries: Types.ObjectId[];

  @MongooseModule.Prop()
  familyGroup: string;

  @MongooseModule.Prop()
  notes: string;

  @MongooseModule.Prop()
  photoUrl: string;

  @MongooseModule.Prop({ default: true })
  isActive: boolean;
}

export const MemberSchema = MongooseModule.SchemaFactory.createForClass(Member);

// Virtual: age
MemberSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birth = new Date(this.birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

MemberSchema.set('toJSON', { virtuals: true });
MemberSchema.set('toObject', { virtuals: true });
