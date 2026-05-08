import * as MongooseModule from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@MongooseModule.Schema({ timestamps: true })
export class FinanceCategory extends Document {
  @MongooseModule.Prop({ required: true })
  name: string;

  @MongooseModule.Prop({ required: true, enum: ['INCOME', 'EXPENSE'] })
  type: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Church' })
  church: Types.ObjectId;

  @MongooseModule.Prop({ default: false })
  isDeleted: boolean;
}

export const FinanceCategorySchema = MongooseModule.SchemaFactory.createForClass(FinanceCategory);

@MongooseModule.Schema({ timestamps: true, discriminatorKey: 'kind', collection: 'finance' })
export class Finance extends Document {
  @MongooseModule.Prop({ required: true })
  amount: number;

  @MongooseModule.Prop({ required: true })
  date: Date;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'FinanceCategory', required: true })
  category: Types.ObjectId;

  @MongooseModule.Prop({ enum: ['Tithe', 'Offering', 'Expense'], required: true })
  kind: string;

  @MongooseModule.Prop()
  description: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Church', required: true })
  church: Types.ObjectId;

  @MongooseModule.Prop({ default: false })
  isDeleted: boolean;
}

export const FinanceSchema = MongooseModule.SchemaFactory.createForClass(Finance);

// --- Tithe Discriminator ---
@MongooseModule.Schema()
export class Tithe {
  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  member: Types.ObjectId;

  @MongooseModule.Prop({ enum: ['CASH', 'TRANSFER', 'CHECK'], default: 'CASH' })
  method: string;
}
export const TitheSchema = MongooseModule.SchemaFactory.createForClass(Tithe);

// --- Offering Discriminator ---
@MongooseModule.Schema()
export class Offering {
  @MongooseModule.Prop({ enum: ['GENERAL', 'MISSION', 'CONSTRUCTION', 'SPECIAL'], default: 'GENERAL' })
  type: string;

  @MongooseModule.Prop({ type: Types.ObjectId, ref: 'Member' })
  member: Types.ObjectId; // Optional for offerings
}
export const OfferingSchema = MongooseModule.SchemaFactory.createForClass(Offering);

// --- Expense Discriminator ---
@MongooseModule.Schema()
export class Expense {
  @MongooseModule.Prop({ required: true })
  recipient: string;

  @MongooseModule.Prop()
  referenceNumber: string;
}
export const ExpenseSchema = MongooseModule.SchemaFactory.createForClass(Expense);
