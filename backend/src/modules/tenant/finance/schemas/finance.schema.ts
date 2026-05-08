import * as NestMongoose from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const { Prop, Schema, SchemaFactory } = NestMongoose;

@Schema({ timestamps: true })
export class FinanceCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId;
}

export const FinanceCategorySchema = SchemaFactory.createForClass(FinanceCategory);

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'FinanceCategory', required: true })
  category: Types.ObjectId;

  @Prop({ enum: ['Tithe', 'Offering', 'Expense'], required: true })
  kind: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Member' })
  member: Types.ObjectId; // For tithes/offerings

  @Prop({ type: Types.ObjectId, ref: 'Church', required: true })
  church: Types.ObjectId;

  // Additional fields for tithes
  @Prop({ enum: ['CASH', 'TRANSFER', 'CHECK'], default: 'CASH' })
  method: string;

  // Additional fields for offerings
  @Prop({ enum: ['GENERAL', 'MISSION', 'CONSTRUCTION', 'SPECIAL'], default: 'GENERAL' })
  type: string;

  // Additional fields for expenses
  @Prop()
  recipient: string;

  @Prop()
  referenceNumber: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
