import { Schema, model, Document } from 'mongoose';
import { THNStatus } from '../types';

export interface ITruckHiringNote extends Document {
  thnNumber: number;
  date: string;
  transporterCompanyName: string;
  truckNumber: string;
  origin: string;
  destination: string;
  goodsType: string;
  weight: number;
  freight: number;
  advancePaid: number;
  balancePayable: number;
  expectedDeliveryDate: string;
  specialInstructions?: string;
  status: THNStatus;
  paidAmount: number;
  payments: Schema.Types.ObjectId[];
  // New financial fields
  paymentTerms: 'COD' | 'Credit' | 'Advance';
  reminders: string;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  loadingCharges: number;
  unloadingCharges: number;
  detentionCharges: number;
  totalGstAmount: number;
  grandTotal: number;
}

const TruckHiringNoteSchema = new Schema({
  thnNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  transporterCompanyName: { type: String, required: true },
  truckNumber: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  goodsType: { type: String, required: true },
  weight: { type: Number, required: true },
  freight: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  balancePayable: { type: Number, required: true },
  expectedDeliveryDate: { type: String, required: true },
  specialInstructions: { type: String },
  status: { type: String, enum: Object.values(THNStatus), default: THNStatus.UNPAID },
  paidAmount: { type: Number, default: 0 },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  // New financial fields
  paymentTerms: { type: String, enum: ['COD', 'Credit', 'Advance'], default: 'COD' },
  reminders: { type: String, default: '' },
  gstRate: { type: Number, default: 18 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  loadingCharges: { type: Number, default: 0 },
  unloadingCharges: { type: Number, default: 0 },
  detentionCharges: { type: Number, default: 0 },
  totalGstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default model<ITruckHiringNote>('TruckHiringNote', TruckHiringNoteSchema);
