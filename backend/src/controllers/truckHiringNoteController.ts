import { Request, Response } from 'express';
import TruckHiringNote from '../models/truckHiringNote';
import { getNextSequenceValue } from '../utils/sequence';

export const getTruckHiringNotes = async (req: Request, res: Response) => {
  try {
    const notes = await TruckHiringNote.find().populate('payments').sort({ thnNumber: -1 });
    res.json(notes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTruckHiringNoteById = async (req: Request, res: Response) => {
    try {
        const note = await TruckHiringNote.findById(req.params.id).populate('payments');
        if (note == null) {
            return res.status(404).json({ message: 'Cannot find Truck Hiring Note' });
        }
        res.json(note);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createTruckHiringNote = async (req: Request, res: Response) => {
  const { freight, advancePaid, ...rest } = req.body;

  try {
    const nextThnNumber = await getNextSequenceValue('truckHiringNoteId');

    const balancePayable = freight - advancePaid;

    const note = new TruckHiringNote({
      ...rest,
      thnNumber: nextThnNumber,
      freight,
      advancePaid,
      balancePayable,
    });

    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTruckHiringNote = async (req: Request, res: Response) => {
    try {
        const { freight, advancePaid, ...rest } = req.body;

        const balancePayable = freight - advancePaid;

        const updatedData = {
            ...rest,
            freight,
            advancePaid,
            balancePayable,
        };

        const updatedNote = await TruckHiringNote.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (updatedNote == null) {
            return res.status(404).json({ message: 'Cannot find Truck Hiring Note' });
        }
        res.json(updatedNote);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
