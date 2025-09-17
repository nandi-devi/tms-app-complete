import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import TruckHiringNote from '../models/truckHiringNote';
import { getNextSequenceValue } from '../utils/sequence';
import { createTruckHiringNoteSchema, updateTruckHiringNoteSchema } from '../utils/validation';
import { THNStatus } from '../types';

export const getTruckHiringNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await TruckHiringNote.find().populate('payments').sort({ thnNumber: -1 });
  console.log(`Returning ${notes.length} THNs with statuses:`, notes.map(n => ({ thnNumber: n.thnNumber, status: n.status, paidAmount: n.paidAmount, balanceAmount: n.balanceAmount })));
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
  try {
    console.log('Received THN data:', JSON.stringify(req.body, null, 2));
    
    const noteData = createTruckHiringNoteSchema.parse(req.body);
    console.log('Validated data:', JSON.stringify(noteData, null, 2));
    
    const nextThnNumber = await getNextSequenceValue('truckHiringNoteId');
    console.log('Generated THN number:', nextThnNumber);
    
    const totalAmount = noteData.freightRate + (noteData.additionalCharges || 0);
    const balanceAmount = totalAmount - (noteData.advanceAmount || 0);

    const note = new TruckHiringNote({
      thnNumber: nextThnNumber,
      ...noteData,
      advanceAmount: noteData.advanceAmount || 0,
      balanceAmount,
      additionalCharges: noteData.additionalCharges || 0,
      status: THNStatus.UNPAID,
      paidAmount: 0,
      payments: []
    });

    const newNote = await note.save();
    console.log('Saved THN:', newNote._id);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating THN:', error);
    
    // Handle validation errors specifically
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors: { [key: string]: string[] } = {};
      if ((error as any).errors) {
        Object.keys((error as any).errors).forEach(key => {
          validationErrors[key] = [(error as any).errors[key].message];
        });
      }
      
      res.status(400).json({
        message: 'Validation failed',
        errors: {
          fieldErrors: validationErrors
        }
      });
      return;
    }
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodErrors: { [key: string]: string[] } = {};
      if ((error as any).issues) {
        (error as any).issues.forEach((issue: any) => {
          const field = issue.path.join('.');
          if (!zodErrors[field]) zodErrors[field] = [];
          zodErrors[field].push(issue.message);
        });
      }
      
      res.status(400).json({
        message: 'Validation failed',
        errors: {
          fieldErrors: zodErrors
        }
      });
      return;
    }
    
    res.status(500).json({ 
      message: 'Failed to create truck hiring note', 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });
  }
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
