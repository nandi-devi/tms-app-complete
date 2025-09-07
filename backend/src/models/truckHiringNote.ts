import { Schema, model, Document } from 'mongoose';

export interface ITruckHiringNote extends Document {
  thnNumber: number;
  date: string;
  truckOwnerName: string;
  truckNumber: string;
  driverName: string;
  driverLicense: string;
  origin: string;
  destination: string;
  goodsType: string;
  weight: number;
  freight: number;
  advancePaid: number;
  balancePayable: number;
  expectedDeliveryDate: string;
  specialInstructions?: string;
}

const TruckHiringNoteSchema = new Schema({
  thnNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  truckOwnerName: { type: String, required: true },
  truckNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverLicense: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  goodsType: { type: String, required: true },
  weight: { type: Number, required: true },
  freight: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  balancePayable: { type: Number, required: true },
  expectedDeliveryDate: { type: String, required: true },
  specialInstructions: { type: String },
}, {
  timestamps: true,
});

export default model<ITruckHiringNote>('TruckHiringNote', TruckHiringNoteSchema);
