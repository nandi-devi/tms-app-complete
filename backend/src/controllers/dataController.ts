import { Request, Response } from 'express';
import Customer from '../models/customer';
import Vehicle from '../models/vehicle';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';
import Payment from '../models/payment';
import Counter from '../models/counter';
import { mockCustomers, mockVehicles, mockLorryReceipts, mockInvoices, mockPayments } from '../../mockData'; // Assuming mockData is in the root

export const resetData = async (req: Request, res: Response) => {
    try {
        await Customer.deleteMany({});
        await Vehicle.deleteMany({});
        await LorryReceipt.deleteMany({});
        await Invoice.deleteMany({});
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
        await Payment.deleteMany({});
        await Counter.deleteMany({});

        // NOTE: This is a simplified mock data loading. It does not handle relationships correctly
        // (e.g., consignorId in mock LRs won't match the new mock Customer _ids).
        // A more advanced implementation would create customers, get their new _ids, and then
        // create LRs using those _ids. For now, this will just insert the raw mock data.
        // This will be fixed later if needed.

        await Customer.insertMany(mockCustomers);
        await Vehicle.insertMany(mockVehicles);
        // We will not load mock LRs, Invoices, or Payments for now as their relational
        // IDs (_id, customerId, etc.) are hardcoded and will not match the newly
        // inserted mock customers/vehicles. This prevents application errors.
        // The sequential ID counter will also be reset.

        res.status(200).json({ message: 'Successfully loaded mock customers and vehicles. Other data is reset.' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to load mock data.', error: err.message });
    }
};
