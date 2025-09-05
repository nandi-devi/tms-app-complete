import { Schema, model, Document } from 'mongoose';
export enum GstType {
    CGST_SGST = 'CGST/SGST',
    IGST = 'IGST',
}

export interface IInvoice extends Document {
  id: number;
  date: string;
  customer: Schema.Types.ObjectId;
  lorryReceipts: Schema.Types.ObjectId[];
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
}

const InvoiceSchema = new Schema({
  id: { type: Number, unique: true },
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
