import { Request, Response } from 'express';
import Customer from '../models/customer';
import Vehicle from '../models/vehicle';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';
import TruckHiringNote from '../models/truckHiringNote';
import Payment from '../models/payment';
import Counter from '../models/counter';

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

export const backupData = async (req: Request, res: Response) => {
    try {
        const customers = await Customer.find({});
        const vehicles = await Vehicle.find({});
        const lorryReceipts = await LorryReceipt.find({});
        const invoices = await Invoice.find({});
        const truckHiringNotes = await TruckHiringNote.find({});
        const payments = await Payment.find({});
        const counters = await Counter.find({});

        const backup = {
            customers,
            vehicles,
            lorryReceipts,
            invoices,
            truckHiringNotes,
            payments,
            counters,
            backupDate: new Date(),
        };

        res.status(200).json(backup);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to create backup.', error: err.message });
    }
};

export const restoreData = async (req: Request, res: Response) => {
    const { customers, vehicles, lorryReceipts, invoices, truckHiringNotes, payments, counters } = req.body;

    // Basic validation
    if (!customers || !vehicles || !lorryReceipts || !invoices || !truckHiringNotes || !payments || !counters) {
        return res.status(400).json({ message: 'Invalid backup file format.' });
    }

    try {
        // 1. Delete all existing data
        await Customer.deleteMany({});
        await Vehicle.deleteMany({});
        await LorryReceipt.deleteMany({});
        await Invoice.deleteMany({});
        await TruckHiringNote.deleteMany({});
        await Payment.deleteMany({});
        await Counter.deleteMany({});

        // 2. Insert new data from backup
        // Using { ordered: false } might be useful if some documents could fail validation,
        // but for a full restore, we expect all data to be valid.
        await Customer.insertMany(customers);
        await Vehicle.insertMany(vehicles);
        await LorryReceipt.insertMany(lorryReceipts);
        await Invoice.insertMany(invoices);
        await TruckHiringNote.insertMany(truckHiringNotes);
        await Payment.insertMany(payments);
        await Counter.insertMany(counters);

        res.status(200).json({ message: 'Data has been restored successfully.' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to restore data.', error: err.message });
    }
};
