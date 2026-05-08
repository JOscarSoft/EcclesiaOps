import { Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export class Role extends Document {
  name: string;
  permissions: Types.ObjectId[];
}

export const RoleSchema = new Schema({
  name: { type: String, required: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
}, { timestamps: true });
