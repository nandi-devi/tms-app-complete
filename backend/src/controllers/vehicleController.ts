import { Request, Response } from 'express';
import Vehicle from '../models/vehicle';

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  const vehicle = new Vehicle({
    number: req.body.number,
  });

  try {
    const newVehicle = await vehicle.save();
    res.status(201).json(newVehicle);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
