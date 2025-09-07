import { Schema, model, Document, Types } from 'mongoose';

export enum RentalType {
    PER_DAY = 'per-day',
    PER_KM = 'per-km',
    PER_HOUR = 'per-hour',
}

export interface ITruckRental extends Document {
  supplier: Types.ObjectId;
  truck: Types.ObjectId;
  rentalRate: number;
  rentalType: RentalType;
  startDate: Date;
  endDate?: Date;
}

const TruckRentalSchema = new Schema({
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  truck: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  rentalRate: { type: Number, required: true },
  rentalType: { type: String, enum: Object.values(RentalType), required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
}, {
  timestamps: true,
});

export default model<ITruckRental>('TruckRental', TruckRentalSchema);
