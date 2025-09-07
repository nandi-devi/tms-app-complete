import { Schema, model, Document, Types } from 'mongoose';
import { GstType, InvoiceStatus } from '../types';

export interface IInvoice extends Document {
  invoiceNumber: number;
  date: string;
  customer: Types.ObjectId;
  lorryReceipts: Types.ObjectId[];
  totalAmount: number;
  remarks: string;
  gstType: GstType;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  isRcm: boolean;
  isManualGst: boolean;
  status: InvoiceStatus;
  payments: Types.ObjectId[];
  dueDate?: string;
}

const InvoiceSchema = new Schema({
  invoiceNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  lorryReceipts: [{ type: Schema.Types.ObjectId, ref: 'LorryReceipt' }],
  totalAmount: { type: Number, required: true },
  remarks: { type: String },
  gstType: { type: String, enum: Object.values(GstType), required: true },
  cgstRate: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
  igstRate: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  isRcm: { type: Boolean, default: false },
  isManualGst: { type: Boolean, default: false },
  status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.UNPAID },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  dueDate: { type: String },
});

export default model<IInvoice>('Invoice', InvoiceSchema);
