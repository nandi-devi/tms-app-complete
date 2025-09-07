import { Request, Response } from 'express';
import TruckRental from '../models/truckRental';

// @desc    Get all truck rentals
// @route   GET /api/truckrentals
// @access  Public
export const getTruckRentals = async (req: Request, res: Response) => {
  try {
    const rentals = await TruckRental.find().populate('supplier').populate('truck');
    res.json(rentals);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single truck rental
// @route   GET /api/truckrentals/:id
// @access  Public
export const getTruckRentalById = async (req: Request, res: Response) => {
    try {
        const rental = await TruckRental.findById(req.params.id).populate('supplier').populate('truck');
        if (rental == null) {
            return res.status(404).json({ message: 'Cannot find truck rental' });
        }
        res.json(rental);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @desc    Create a truck rental
// @route   POST /api/truckrentals
// @access  Public
export const createTruckRental = async (req: Request, res: Response) => {
  const { supplier, truck, rentalRate, rentalType, startDate, endDate } = req.body;

  const rental = new TruckRental({
    supplier,
    truck,
    rentalRate,
    rentalType,
    startDate,
    endDate,
  });

  try {
    const newRental = await rental.save();
    const populatedRental = await TruckRental.findById(newRental._id).populate('supplier').populate('truck');
    res.status(201).json(populatedRental);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a truck rental
// @route   PUT /api/truckrentals/:id
// @access  Public
export const updateTruckRental = async (req: Request, res: Response) => {
    try {
        const updatedRental = await TruckRental.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplier').populate('truck');
        if (updatedRental == null) {
            return res.status(404).json({ message: 'Cannot find truck rental' });
        }
        res.json(updatedRental);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a truck rental
// @route   DELETE /api/truckrentals/:id
// @access  Public
export const deleteTruckRental = async (req: Request, res: Response) => {
    try {
        // TODO: Add check to prevent deletion if rental is used in a LorryReceipt
        const rental = await TruckRental.findByIdAndDelete(req.params.id);
        if (rental == null) {
            return res.status(404).json({ message: 'Cannot find truck rental' });
        }
        res.json({ message: 'Deleted Truck Rental' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
