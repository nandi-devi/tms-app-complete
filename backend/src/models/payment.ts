import { Schema, model, Document } from 'mongoose';
export enum PaymentType {
    ADVANCE = 'Advance',
    RECEIPT = 'Receipt',
}

export enum PaymentMode {
    CASH = 'Cash',
    CHEQUE = 'Cheque',
    NEFT = 'NEFT',
    RTGS = 'RTGS',
    UPI = 'UPI',
}

export interface IPayment extends Document {
  customer: Schema.Types.ObjectId;
  date: string;
  amount: number;
  type: PaymentType;
  mode: PaymentMode;
  referenceNo?: string;
  notes?: string;
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
