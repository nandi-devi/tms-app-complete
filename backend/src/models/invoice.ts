import { Schema, model, Document, Types } from 'mongoose';
import { GstType, InvoiceStatus } from '../types';
import { IPayment } from './payment';

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
  payments: (Types.ObjectId | IPayment)[];
  dueDate?: string;
  // Virtuals
  paidAmount: number;
  balanceDue: number;
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
}, {
  // Ensure virtuals are included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
InvoiceSchema.index({ customer: 1, date: -1 });
InvoiceSchema.index({ status: 1, date: -1 });
InvoiceSchema.index({ invoiceNumber: -1 });

// Virtual for total paid amount
InvoiceSchema.virtual('paidAmount').get(function(this: IInvoice) {
  // Ensure payments are populated and it's an array of documents, not just ObjectIDs
  if (this.payments && this.payments.length > 0 && (this.payments[0] as IPayment).amount !== undefined) {
    return this.payments.reduce((total, payment) => total + (payment as IPayment).amount, 0);
  }
  return 0;
});

// Virtual for balance due
InvoiceSchema.virtual('balanceDue').get(function(this: IInvoice) {
  let paidAmount = 0;
  // Ensure payments are populated and it's an array of documents, not just ObjectIDs
  if (this.payments && this.payments.length > 0 && (this.payments[0] as IPayment).amount !== undefined) {
    paidAmount = this.payments.reduce((total, payment) => total + (payment as IPayment).amount, 0);
  }
  return this.grandTotal - paidAmount;
});


export default model<IInvoice>('Invoice', InvoiceSchema);
