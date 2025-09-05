import { Schema, model, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  tradeName?: string;
  address: string;
  state: string;
  gstin: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  tradeName: { type: String },
  address: { type: String, required: true },
  state: { type: String, required: true },
  gstin: { type: String, required: true },
  contactPerson: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
});

export default model<ICustomer>('Customer', CustomerSchema);
