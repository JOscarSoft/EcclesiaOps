import { Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VISITOR = 'VISITOR',
}

export class Member extends Document {
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  status: MemberStatus;
  baptized: boolean;
  baptismDate: Date;
  joinDate: Date;
  phone: string;
  email: string;
  address: string;
  church: Types.ObjectId;
  ministries: Types.ObjectId[];
  familyGroup: string;
  notes: string;
  photoUrl: string;
  isActive: boolean;
}

export const MemberSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date },
  gender: { type: String, enum: Object.values(Gender) },
  status: { type: String, enum: Object.values(MemberStatus), default: MemberStatus.ACTIVE },
  baptized: { type: Boolean, default: false },
  baptismDate: { type: Date },
  joinDate: { type: Date },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  church: { type: Schema.Types.ObjectId, ref: 'Church' },
  ministries: [{ type: Schema.Types.ObjectId, ref: 'Ministry' }],
  familyGroup: { type: String },
  notes: { type: String },
  photoUrl: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'members' });

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
