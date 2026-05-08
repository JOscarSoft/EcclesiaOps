import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export class Permission extends Document {
  name: string;
  description: string;
}

export const PermissionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});
