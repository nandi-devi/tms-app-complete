import { Request, Response } from 'express';
import Vehicle from '../models/vehicle';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = async (req: Request, res: Response) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (vehicle == null) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }
        res.json(vehicle);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Public
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

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Public
export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedVehicle == null) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }
        res.json(updatedVehicle);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Public
export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (vehicle == null) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }
        res.json({ message: 'Deleted Vehicle' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
