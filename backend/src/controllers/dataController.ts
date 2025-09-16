import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Customer from '../models/customer';
import Vehicle from '../models/vehicle';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';
import TruckHiringNote from '../models/truckHiringNote';
import Payment from '../models/payment';
import Counter from '../models/counter';
import NumberingConfig from '../models/numbering';
import { backupDataSchema } from '../utils/validation';

export const resetData = asyncHandler(async (req: Request, res: Response) => {
  await Customer.deleteMany({});
  await Vehicle.deleteMany({});
  await LorryReceipt.deleteMany({});
  await Invoice.deleteMany({});
  await TruckHiringNote.deleteMany({});
  await Payment.deleteMany({});
  await Counter.deleteMany({});
  res.status(200).json({ message: 'All data has been reset successfully.' });
});

export const backupData = asyncHandler(async (req: Request, res: Response) => {
  const customers = await Customer.find({});
  const vehicles = await Vehicle.find({});
  const lorryReceipts = await LorryReceipt.find({});
  const invoices = await Invoice.find({});
  const truckHiringNotes = await TruckHiringNote.find({});
  const payments = await Payment.find({});
  const counters = await Counter.find({});
  const numberingConfigs = await NumberingConfig.find({});

  const backup = {
    customers,
    vehicles,
    lorryReceipts,
    invoices,
    truckHiringNotes,
    payments,
    counters,
    numberingConfigs,
  };

  res.status(200).json(backup);
});

export const restoreData = asyncHandler(async (req: Request, res: Response) => {
  const backup = backupDataSchema.parse(req.body);
  const { customers, vehicles, lorryReceipts, invoices, truckHiringNotes, payments, counters, numberingConfigs } = backup;

  // Clear existing data
  await Customer.deleteMany({});
  await Vehicle.deleteMany({});
  await LorryReceipt.deleteMany({});
  await Invoice.deleteMany({});
  await TruckHiringNote.deleteMany({});
  await Payment.deleteMany({});
  await Counter.deleteMany({});
  await NumberingConfig.deleteMany({});

  // Insert new data
  if (customers) await Customer.insertMany(customers);
  if (vehicles) await Vehicle.insertMany(vehicles);
  if (lorryReceipts) await LorryReceipt.insertMany(lorryReceipts);
  if (invoices) await Invoice.insertMany(invoices);
  if (truckHiringNotes) await TruckHiringNote.insertMany(truckHiringNotes);
  if (payments) await Payment.insertMany(payments);
  if (counters) await Counter.insertMany(counters);
  if (numberingConfigs) await NumberingConfig.insertMany(numberingConfigs);

  res.status(200).json({ message: 'Data restored successfully.' });
});
