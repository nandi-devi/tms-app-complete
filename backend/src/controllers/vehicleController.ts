import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import Vehicle from '../models/vehicle';

// Zod schema for vehicle creation
const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
});

// Zod schema for vehicle update
const updateVehicleSchema = createVehicleSchema.partial();

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await Vehicle.find({});
  res.json(vehicles);
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Public
export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicleData = createVehicleSchema.parse(req.body);
  const vehicle = new Vehicle(vehicleData);
  const createdVehicle = await vehicle.save();
  res.status(201).json(createdVehicle);
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Public
export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicleData = updateVehicleSchema.parse(req.body);
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    vehicle.vehicleNumber = vehicleData.vehicleNumber || vehicle.vehicleNumber;
    vehicle.driverName = vehicleData.driverName || vehicle.driverName;
    vehicle.driverPhone = vehicleData.driverPhone || vehicle.driverPhone;

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Public
export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed' });
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

