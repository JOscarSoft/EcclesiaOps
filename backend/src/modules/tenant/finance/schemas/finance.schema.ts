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

  @Prop({ default: false })
  isDeleted: boolean;
}

export const FinanceCategorySchema = SchemaFactory.createForClass(FinanceCategory);

@Schema({ timestamps: true, discriminatorKey: 'kind', collection: 'finance' })
export class Finance extends Document {
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

  @Prop({ type: Types.ObjectId, ref: 'Church', required: true })
  church: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);

// --- Tithe Discriminator ---
@Schema()
export class Tithe {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  member: Types.ObjectId;

  @Prop({ enum: ['CASH', 'TRANSFER', 'CHECK'], default: 'CASH' })
  method: string;
}
export const TitheSchema = SchemaFactory.createForClass(Tithe);

// --- Offering Discriminator ---
@Schema()
export class Offering {
  @Prop({ enum: ['GENERAL', 'MISSION', 'CONSTRUCTION', 'SPECIAL'], default: 'GENERAL' })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Member' })
  member: Types.ObjectId; // Optional for offerings
}
export const OfferingSchema = SchemaFactory.createForClass(Offering);

// --- Expense Discriminator ---
@Schema()
export class Expense {
  @Prop({ required: true })
  recipient: string;

  @Prop()
  referenceNumber: string;
}
export const ExpenseSchema = SchemaFactory.createForClass(Expense);
