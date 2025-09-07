import { Schema, model, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  paymentTerms?: string;
  notes?: string;
}

const SupplierSchema = new Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  paymentTerms: { type: String, trim: true },
  notes: { type: String, trim: true },
}, {
  timestamps: true,
});

export default model<ISupplier>('Supplier', SupplierSchema);
