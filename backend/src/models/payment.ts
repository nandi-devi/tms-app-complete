import { Schema, model, Document } from 'mongoose';
import { Payment as IPaymentType, PaymentType, PaymentMode } from '../types';

export interface IPayment extends Omit<IPaymentType, '_id'>, Document {
  customer: Schema.Types.ObjectId;
}

const PaymentSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(PaymentType), required: true },
  mode: { type: String, enum: Object.values(PaymentMode), required: true },
  referenceNo: { type: String },
  notes: { type: String },
});

export default model<IPayment>('Payment', PaymentSchema);
