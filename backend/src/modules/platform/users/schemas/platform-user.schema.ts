import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export class PlatformUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
}

export const PlatformUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });
