import { Request, Response } from 'express';
import PromissoryNote from '../models/promissoryNote';

// @desc    Get all promissory notes
// @route   GET /api/promissorynotes
// @access  Public
export const getPromissoryNotes = async (req: Request, res: Response) => {
  try {
    const notes = await PromissoryNote.find().populate('supplier');
    res.json(notes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single promissory note
// @route   GET /api/promissorynotes/:id
// @access  Public
export const getPromissoryNoteById = async (req: Request, res: Response) => {
    try {
        const note = await PromissoryNote.findById(req.params.id).populate('supplier');
        if (note == null) {
            return res.status(404).json({ message: 'Cannot find promissory note' });
        }
        res.json(note);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @desc    Create a promissory note
// @route   POST /api/promissorynotes
// @access  Public
export const createPromissoryNote = async (req: Request, res: Response) => {
  const { supplier, amount, issueDate, dueDate, paymentTerms, isPaid } = req.body;

  const note = new PromissoryNote({
    supplier,
    amount,
    issueDate,
    dueDate,
    paymentTerms,
    isPaid,
  });

  try {
    const newNote = await note.save();
    const populatedNote = await PromissoryNote.findById(newNote._id).populate('supplier');
    res.status(201).json(populatedNote);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a promissory note
// @route   PUT /api/promissorynotes/:id
// @access  Public
export const updatePromissoryNote = async (req: Request, res: Response) => {
    try {
        const updatedNote = await PromissoryNote.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplier');
        if (updatedNote == null) {
            return res.status(404).json({ message: 'Cannot find promissory note' });
        }
        res.json(updatedNote);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a promissory note
// @route   DELETE /api/promissorynotes/:id
// @access  Public
export const deletePromissoryNote = async (req: Request, res: Response) => {
    try {
        const note = await PromissoryNote.findByIdAndDelete(req.params.id);
        if (note == null) {
            return res.status(404).json({ message: 'Cannot find promissory note' });
        }
        res.json({ message: 'Deleted Promissory Note' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
