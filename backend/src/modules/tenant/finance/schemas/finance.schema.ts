import { Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export class FinanceCategory extends Document {
  name: string;
  type: string;
  church: Types.ObjectId;
  isDeleted: boolean;
}

export const FinanceCategorySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['INCOME', 'EXPENSE'] },
  church: { type: Schema.Types.ObjectId, ref: 'Church' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export class Finance extends Document {
  amount: number;
  date: Date;
  category: Types.ObjectId;
  kind: string;
  description: string;
  church: Types.ObjectId;
  isDeleted: boolean;
}

export const FinanceSchema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'FinanceCategory', required: true },
  kind: { type: String, enum: ['Income', 'Expense'], required: true },
  description: { type: String },
  church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true, discriminatorKey: 'kind', collection: 'finance' });

// --- Income Discriminator ---
export class Income {
  member: Types.ObjectId;
  method: string;
}
export const IncomeSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: 'Member' },
  method: { type: String, enum: ['CASH', 'TRANSFER', 'CHECK'], default: 'CASH' },
});

// --- Expense Discriminator ---
export class Expense {
  recipient: string;
  referenceNumber: string;
}
export const ExpenseSchema = new Schema({
  recipient: { type: String, required: true },
  referenceNumber: { type: String },
});
