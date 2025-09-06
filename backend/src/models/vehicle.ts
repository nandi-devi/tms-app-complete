import { Schema, model, Document } from 'mongoose';
import { Vehicle as IVehicleType } from '../types';

export interface IVehicle extends IVehicleType, Document {}

const VehicleSchema = new Schema({
  number: { type: String, required: true, unique: true },
});

export default model<IVehicle>('Vehicle', VehicleSchema);
