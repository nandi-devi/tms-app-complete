import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import TruckHiringNote from '../models/truckHiringNote';
import { getNextSequenceValue } from '../utils/sequence';
import { createTruckHiringNoteSchema, updateTruckHiringNoteSchema } from '../utils/validation';

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
  const noteData = createTruckHiringNoteSchema.parse(req.body);
  const nextThnNumber = await getNextSequenceValue('truckHiringNoteId');
  const balanceAmount = noteData.freightRate - (noteData.advanceAmount || 0);

  const note = new TruckHiringNote({
    thnNumber: nextThnNumber,
    ...noteData,
    advanceAmount: noteData.advanceAmount || 0,
    balanceAmount,
    additionalCharges: noteData.additionalCharges || 0,
    status: 'UNPAID',
    paidAmount: 0,
    payments: []
  });

  const newNote = await note.save();
  res.status(201).json(newNote);
});

export const updateTruckHiringNote = asyncHandler(async (req: Request, res: Response) => {
  const updateData = updateTruckHiringNoteSchema.parse(req.body);
  const { freightRate, advanceAmount, additionalCharges } = updateData;

  // Recalculate balance if financial fields are updated
  if (freightRate !== undefined || advanceAmount !== undefined || additionalCharges !== undefined) {
    const existingNote = await TruckHiringNote.findById(req.params.id);
    if (existingNote) {
      const newFreightRate = freightRate !== undefined ? freightRate : existingNote.freightRate;
      const newAdvanceAmount = advanceAmount !== undefined ? advanceAmount : existingNote.advanceAmount;
      const newAdditionalCharges = additionalCharges !== undefined ? additionalCharges : existingNote.additionalCharges;
      
      (updateData as any).freightRate = newFreightRate;
      (updateData as any).advanceAmount = newAdvanceAmount;
      (updateData as any).additionalCharges = newAdditionalCharges;
      (updateData as any).balanceAmount = newFreightRate + newAdditionalCharges - newAdvanceAmount;
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
