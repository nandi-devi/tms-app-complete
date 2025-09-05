import { Schema, model, Document } from 'mongoose';

export interface IVehicle extends Document {
  number: string;
}

const VehicleSchema = new Schema({
  number: { type: String, required: true, unique: true },
});

export default model<IVehicle>('Vehicle', VehicleSchema);
