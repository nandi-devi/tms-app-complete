import { Schema, model, Document } from 'mongoose';
import { Invoice as IInvoiceType, GstType } from '../types';

export interface IInvoice extends Omit<IInvoiceType, '_id' | 'invoiceNumber' | 'customer' | 'customerId' | 'lorryReceipts'>, Document {
  customer: Schema.Types.ObjectId;
  lorryReceipts: Schema.Types.ObjectId[];
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
});

export default model<IInvoice>('Invoice', InvoiceSchema);
