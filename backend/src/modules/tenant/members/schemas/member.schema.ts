import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ timestamps: true, collection: 'members' })
export class Member extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  birthDate: Date;

  @Prop({ type: String, enum: Gender })
  gender: Gender;

  @Prop({ type: String, enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @Prop({ default: false })
  baptized: boolean;

  @Prop()
  baptismDate: Date;

  @Prop()
  joinDate: Date;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Ministry' }], default: [] })
  ministries: Types.ObjectId[];

  @Prop()
  familyGroup: string;

  @Prop()
  notes: string;

  @Prop()
  photoUrl: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

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
