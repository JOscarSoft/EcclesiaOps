import { Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export class User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Types.ObjectId;
  church: Types.ObjectId;
  isActive: boolean;
}

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  church: { type: Schema.Types.ObjectId, ref: 'Church' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
