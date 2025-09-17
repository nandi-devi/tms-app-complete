import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import TruckHiringNote from '../models/truckHiringNote';
import { getNextSequenceValue } from '../utils/sequence';

export const getTruckHiringNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await TruckHiringNote.find().populate('payments').sort({ thnNumber: -1 });
  res.json(notes);
});

export const getTruckHiringNoteById = asyncHandler(async (req: Request, res: Response) => {
  const note = await TruckHiringNote.findById(req.params.id).populate('payments');
  if (note) {
    res.json(note);
  } else {
    res.status(404);
    throw new Error('Truck Hiring Note not found');
  }
});

export const createTruckHiringNote = asyncHandler(async (req: Request, res: Response) => {
  const {
    date,
    truckNumber,
    truckType,
    vehicleCapacity,
    loadingLocation,
    unloadingLocation,
    loadingDateTime,
    expectedDeliveryDate,
    goodsType,
    agencyName,
    truckOwnerName,
    truckOwnerContact,
    freightRate,
    freightRateType,
    advanceAmount,
    paymentMode,
    paymentTerms,
    additionalCharges,
    remarks,
    linkedLR,
    linkedInvoice
  } = req.body;

  // Validate required fields
  if (!date || !truckNumber || !truckType || !vehicleCapacity || !loadingLocation || 
      !unloadingLocation || !loadingDateTime || !expectedDeliveryDate || !goodsType || 
      !agencyName || !truckOwnerName || !freightRate || !freightRateType || !paymentMode || !paymentTerms) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  const nextThnNumber = await getNextSequenceValue('truckHiringNoteId');
  const balanceAmount = freightRate - (advanceAmount || 0);

  const note = new TruckHiringNote({
    thnNumber: nextThnNumber,
    date,
    truckNumber,
    truckType,
    vehicleCapacity,
    loadingLocation,
    unloadingLocation,
    loadingDateTime,
    expectedDeliveryDate,
    goodsType,
    agencyName,
    truckOwnerName,
    truckOwnerContact,
    freightRate,
    freightRateType,
    advanceAmount: advanceAmount || 0,
    balanceAmount,
    paymentMode,
    paymentTerms,
    additionalCharges: additionalCharges || 0,
    remarks,
    linkedLR,
    linkedInvoice,
    status: 'UNPAID',
    paidAmount: 0,
    payments: []
  });

  const newNote = await note.save();
  res.status(201).json(newNote);
});

export const updateTruckHiringNote = asyncHandler(async (req: Request, res: Response) => {
  const {
    freightRate,
    advanceAmount,
    additionalCharges,
    ...otherFields
  } = req.body;

  const updateData: any = { ...otherFields };

  // Recalculate balance if financial fields are updated
  if (freightRate !== undefined || advanceAmount !== undefined || additionalCharges !== undefined) {
    const existingNote = await TruckHiringNote.findById(req.params.id);
    if (existingNote) {
      const newFreightRate = freightRate !== undefined ? freightRate : existingNote.freightRate;
      const newAdvanceAmount = advanceAmount !== undefined ? advanceAmount : existingNote.advanceAmount;
      const newAdditionalCharges = additionalCharges !== undefined ? additionalCharges : existingNote.additionalCharges;
      
      updateData.freightRate = newFreightRate;
      updateData.advanceAmount = newAdvanceAmount;
      updateData.additionalCharges = newAdditionalCharges;
      updateData.balanceAmount = newFreightRate + newAdditionalCharges - newAdvanceAmount;
    }
  }

  const updatedNote = await TruckHiringNote.findByIdAndUpdate(req.params.id, updateData, { new: true });

  if (!updatedNote) {
    res.status(404);
    throw new Error('Truck Hiring Note not found');
  }
  res.json(updatedNote);
});

export const deleteTruckHiringNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await TruckHiringNote.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Truck Hiring Note not found');
  }

  await TruckHiringNote.findByIdAndDelete(req.params.id);
  res.json({ message: 'Truck Hiring Note deleted successfully' });
});
