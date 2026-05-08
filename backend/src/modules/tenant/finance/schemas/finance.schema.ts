import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// --- CATEGORIES ---
@Schema({ timestamps: true })
export class FinanceCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['INCOME', 'EXPENSE'], required: true })
  type: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Church' })
  church: any;

  @Prop({ default: false })
  isDeleted: boolean;
}
export const FinanceCategorySchema = SchemaFactory.createForClass(FinanceCategory);

// --- FINANCE (BASE) ---
@Schema({ timestamps: true, discriminatorKey: 'kind', collection: 'transactions' })
export class Finance extends Document {
  kind: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FinanceCategory', required: true })
  category: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Church', required: false })
  church: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: any;

  @Prop({ default: false })
  isDeleted: boolean;
}
export const FinanceSchema = SchemaFactory.createForClass(Finance);

// --- TITHE (Ingreso por Miembro) ---
@Schema()
export class Tithe {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Member', required: true })
  member: any;
  
  @Prop({ enum: ['CASH', 'TRANSFER', 'CHECK'], default: 'CASH' })
  method: string;
}
export const TitheSchema = SchemaFactory.createForClass(Tithe);

// --- OFFERING (Ingreso General) ---
@Schema()
export class Offering {
  @Prop({ enum: ['GENERAL', 'MISSION', 'CONSTRUCTION', 'SPECIAL'], default: 'GENERAL' })
  type: string;
}
export const OfferingSchema = SchemaFactory.createForClass(Offering);

// --- EXPENSE ---
@Schema()
export class Expense {
  @Prop()
  referenceNumber: string; // Número de factura o recibo
  
  @Prop()
  recipient: string; // A quién se le pagó
}
export const ExpenseSchema = SchemaFactory.createForClass(Expense);
