import { Schema, model, Document } from 'mongoose';
import { Vehicle as IVehicleType } from '../types';

export interface IVehicle extends Omit<IVehicleType, '_id'>, Document {}

const VehicleSchema = new Schema({
  number: { type: String, required: true, unique: true },
});

export default model<IVehicle>('Vehicle', VehicleSchema);
