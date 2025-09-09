import { Request, Response } from 'express';
import Customer from '../models/customer';
import Vehicle from '../models/vehicle';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';
import TruckHiringNote from '../models/truckHiringNote';
import Payment from '../models/payment';
import Counter from '../models/counter';
import { mockCustomers, mockVehicles, mockTruckHiringNotes } from '../mockData';

export const resetData = async (req: Request, res: Response) => {
    try {
        await Customer.deleteMany({});
        await Vehicle.deleteMany({});
        await LorryReceipt.deleteMany({});
        await Invoice.deleteMany({});
        await TruckHiringNote.deleteMany({});
        await Payment.deleteMany({});
        await Counter.deleteMany({});
        res.status(200).json({ message: 'All data has been reset successfully.' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to reset data.', error: err.message });
    }
};

export const loadMockData = async (req: Request, res: Response) => {
    try {
        // First, reset all data to ensure a clean slate
        await Customer.deleteMany({});
        await Vehicle.deleteMany({});
        await LorryReceipt.deleteMany({});
        await Invoice.deleteMany({});
        await TruckHiringNote.deleteMany({});
        await Payment.deleteMany({});
        await Counter.deleteMany({});

        await Customer.insertMany(mockCustomers);
        await Vehicle.insertMany(mockVehicles);
        await TruckHiringNote.insertMany(mockTruckHiringNotes);

        // Note: We are not loading mock LRs/Invoices as their relational IDs are hardcoded
        // and would not match the newly inserted customers/vehicles.

        res.status(200).json({ message: 'Successfully loaded mock customers, vehicles, and THNs. Other data is reset.' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to load mock data.', error: err.message });
    }
};
