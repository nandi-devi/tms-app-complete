import { Schema, model, Document } from 'mongoose';
import { Customer as ICustomerType } from '../types';

export interface ICustomer extends Omit<ICustomerType, '_id'>, Document {}

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  tradeName: { type: String },
  address: { type: String, required: true },
  state: { type: String, required: true },
  gstin: { type: String, unique: true, sparse: true },
  contactPerson: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
});

export default model<ICustomer>('Customer', CustomerSchema);
