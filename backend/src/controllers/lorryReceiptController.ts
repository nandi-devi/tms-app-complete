import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import LorryReceipt from '../models/lorryReceipt';
import { getNextSequenceValue } from '../utils/sequence';
import { lrListQuerySchema, createLrSchema, updateLrSchema } from '../utils/validation';
import { LorryReceiptStatus } from '../types';

export const getLorryReceipts = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', ...filters } = lrListQuerySchema.parse(req.query);

  const query: any = {};
  if (filters.startDate) query.date = { ...query.date, $gte: new Date(filters.startDate) };
  if (filters.endDate) query.date = { ...query.date, $lte: new Date(filters.endDate) };
  if (filters.customerId) query['consignor.id'] = filters.customerId;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { lrNumber: { $regex: filters.search, $options: 'i' } },
      { 'consignor.name': { $regex: filters.search, $options: 'i' } },
      { 'consignee.name': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const items = await LorryReceipt.find(query)
    .populate('consignor')
    .populate('consignee')
    .populate('vehicle')
    .sort({ lrNumber: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await LorryReceipt.countDocuments(query);

  res.json({ items, total, page: pageNum, limit: limitNum });
});

export const getLorryReceiptById = asyncHandler(async (req: Request, res: Response) => {
  const lorryReceipt = await LorryReceipt.findById(req.params.id)
    .populate('consignor')
    .populate('consignee')
    .populate('vehicle');

  if (lorryReceipt) {
    res.json(lorryReceipt);
  } else {
    res.status(404);
    throw new Error('Lorry Receipt not found');
  }
});

export const createLorryReceipt = asyncHandler(async (req: Request, res: Response) => {
  // Transform frontend data format to backend format before validation
  const transformedData = {
    ...req.body,
    consignor: req.body.consignorId || req.body.consignor,
    consignee: req.body.consigneeId || req.body.consignee,
    vehicle: req.body.vehicleId || req.body.vehicle,
  };
  
  // Remove frontend-specific fields
  delete transformedData.consignorId;
  delete transformedData.consigneeId;
  delete transformedData.vehicleId;
  
  const lrData = createLrSchema.parse(transformedData);
  const lrNumber = await getNextSequenceValue('lorryReceiptId');
  
  const lorryReceipt = new LorryReceipt({
    ...lrData,
    lrNumber,
  });

  const createdLorryReceipt = await lorryReceipt.save();
  res.status(201).json(createdLorryReceipt);
});

export const updateLorryReceipt = asyncHandler(async (req: Request, res: Response) => {
  // Transform frontend data format to backend format before validation
  const transformedData = {
    ...req.body,
    consignor: req.body.consignorId || req.body.consignor,
    consignee: req.body.consigneeId || req.body.consignee,
    vehicle: req.body.vehicleId || req.body.vehicle,
  };
  
  // Remove frontend-specific fields
  delete transformedData.consignorId;
  delete transformedData.consigneeId;
  delete transformedData.vehicleId;
  
  const lrData = updateLrSchema.parse(transformedData);
  const lorryReceipt = await LorryReceipt.findById(req.params.id);

  if (lorryReceipt) {
    Object.assign(lorryReceipt, lrData);
    const updatedLorryReceipt = await lorryReceipt.save();
    res.json(updatedLorryReceipt);
  } else {
    res.status(404);
    throw new Error('Lorry Receipt not found');
  }
});

export const deleteLorryReceipt = asyncHandler(async (req: Request, res: Response) => {
  const lorryReceipt = await LorryReceipt.findById(req.params.id);

  if (lorryReceipt) {
    if (lorryReceipt.status === LorryReceiptStatus.INVOICED) {
      res.status(400);
      throw new Error('Cannot delete an invoiced lorry receipt.');
    }
    await lorryReceipt.deleteOne();
    res.json({ message: 'Lorry Receipt removed' });
  } else {
    res.status(404);
    throw new Error('Lorry Receipt not found');
  }
});
