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
        };

        res.status(200).json(backup);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to backup data.', error: err.message });
    }
};

export const restoreData = async (req: Request, res: Response) => {
    try {
        const { customers, vehicles, lorryReceipts, invoices, truckHiringNotes, payments, counters } = req.body;

        // Clear existing data
        await Customer.deleteMany({});
        await Vehicle.deleteMany({});
        await LorryReceipt.deleteMany({});
        await Invoice.deleteMany({});
        await TruckHiringNote.deleteMany({});
        await Payment.deleteMany({});
        await Counter.deleteMany({});

        // Insert new data
        if (customers) await Customer.insertMany(customers);
        if (vehicles) await Vehicle.insertMany(vehicles);
        if (lorryReceipts) await LorryReceipt.insertMany(lorryReceipts);
        if (invoices) await Invoice.insertMany(invoices);
        if (truckHiringNotes) await TruckHiringNote.insertMany(truckHiringNotes);
        if (payments) await Payment.insertMany(payments);
        if (counters) await Counter.insertMany(counters);

        res.status(200).json({ message: 'Data restored successfully.' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to restore data.', error: err.message });
    }
};
