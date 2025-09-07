import { Schema, model, Document, Types } from 'mongoose';

export interface ISupplierPayment extends Document {
  supplier: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  notes?: string;
  relatedRental?: Types.ObjectId;
}

const SupplierPaymentSchema = new Schema({
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  notes: { type: String },
  relatedRental: { type: Schema.Types.ObjectId, ref: 'TruckRental' },
}, {
  timestamps: true,
});

export default model<ISupplierPayment>('SupplierPayment', SupplierPaymentSchema);
