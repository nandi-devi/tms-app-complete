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
  const thnData = createTruckHiringNoteSchema.parse(req.body);
  const { freight, advancePaid } = thnData;

  const nextThnNumber = await getNextSequenceValue('truckHiringNoteId');
  const balancePayable = freight - advancePaid;

  const note = new TruckHiringNote({
    ...thnData,
    thnNumber: nextThnNumber,
    balancePayable,
  });

  const newNote = await note.save();
  res.status(201).json(newNote);
});

export const updateTruckHiringNote = asyncHandler(async (req: Request, res: Response) => {
  const thnData = updateTruckHiringNoteSchema.parse(req.body);
  const { freight, advancePaid } = thnData;

  const balancePayable = freight && advancePaid ? freight - advancePaid : undefined;

  const updatedData: any = { ...thnData };
  if (balancePayable !== undefined) {
    updatedData.balancePayable = balancePayable;
  }

  const updatedNote = await TruckHiringNote.findByIdAndUpdate(req.params.id, updatedData, { new: true });

  if (!updatedNote) {
    res.status(404);
    throw new Error('Truck Hiring Note not found');
  }
  res.json(updatedNote);
});
