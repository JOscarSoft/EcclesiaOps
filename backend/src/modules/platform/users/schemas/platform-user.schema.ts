import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export class PlatformUser extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  name: string;
}

export const PlatformUserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });
