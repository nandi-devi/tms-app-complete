import { Schema, model, Document } from 'mongoose';
import { PaymentType, PaymentMode } from '../types';

export interface IPayment extends Document {
  invoice?: Schema.Types.ObjectId;
  customer: Schema.Types.ObjectId;
  date: string;
  amount: number;
  type: PaymentType;
  mode: PaymentMode;
  referenceNo?: string;
  notes?: string;
}

const PaymentSchema = new Schema({
  invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(PaymentType), required: true },
  mode: { type: String, enum: Object.values(PaymentMode), required: true },
  referenceNo: { type: String },
  notes: { type: String },
});

export default model<IPayment>('Payment', PaymentSchema);
