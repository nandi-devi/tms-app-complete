import { Schema, model, Document } from 'mongoose';
import { LorryReceipt as ILorryReceiptType, LorryReceiptStatus, GstPayableBy } from '../types';

export interface ILorryReceipt extends Omit<ILorryReceiptType, '_id'>, Document {
  consignor: Schema.Types.ObjectId;
  consignee: Schema.Types.ObjectId;
  vehicle: Schema.Types.ObjectId;
}

const LorryReceiptSchema = new Schema({
  id: { type: Number, unique: true },
  date: { type: String, required: true },
  reportingDate: { type: String },
  deliveryDate: { type: String },
  consignor: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  consignee: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  packages: [
    {
      count: { type: Number, required: true },
      packingMethod: { type: String, required: true },
      description: { type: String, required: true },
      actualWeight: { type: Number, required: true },
      chargedWeight: { type: Number, required: true },
    },
  ],
  charges: {
    freight: { type: Number, default: 0 },
    aoc: { type: Number, default: 0 },
    hamali: { type: Number, default: 0 },
    bCh: { type: Number, default: 0 },
    trCh: { type: Number, default: 0 },
    detentionCh: { type: Number, default: 0 },
  },
  totalAmount: { type: Number, required: true },
  eWayBillNo: { type: String },
  valueGoods: { type: Number },
  gstPayableBy: { type: String, enum: Object.values(GstPayableBy), required: true },
  status: { type: String, enum: Object.values(LorryReceiptStatus), default: LorryReceiptStatus.CREATED },
  insurance: {
    hasInsured: { type: Boolean, default: false },
    company: { type: String },
    policyNo: { type: String },
    date: { type: String },
    amount: { type: Number },
    risk: { type: String },
  },
  invoiceNo: { type: String },
  sealNo: { type: String },
});

export default model<ILorryReceipt>('LorryReceipt', LorryReceiptSchema);
