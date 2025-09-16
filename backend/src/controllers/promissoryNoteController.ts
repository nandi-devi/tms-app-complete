import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PromissoryNote from '../models/promissoryNote';
import { createPromissoryNoteSchema, updatePromissoryNoteSchema } from '../utils/validation';

// @desc    Get all promissory notes
// @route   GET /api/promissorynotes
// @access  Public
export const getPromissoryNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await PromissoryNote.find().populate('supplier');
  res.json(notes);
});

// @desc    Get single promissory note
// @route   GET /api/promissorynotes/:id
// @access  Public
export const getPromissoryNoteById = asyncHandler(async (req: Request, res: Response) => {
  const note = await PromissoryNote.findById(req.params.id).populate('supplier');
  if (note) {
    res.json(note);
  } else {
    res.status(404);
    throw new Error('Promissory Note not found');
  }
});

// @desc    Create a promissory note
// @route   POST /api/promissorynotes
// @access  Public
export const createPromissoryNote = asyncHandler(async (req: Request, res: Response) => {
  const noteData = createPromissoryNoteSchema.parse(req.body);
  const note = new PromissoryNote(noteData);
  const newNote = await note.save();
  const populatedNote = await PromissoryNote.findById(newNote._id).populate('supplier');
  res.status(201).json(populatedNote);
});

// @desc    Update a promissory note
// @route   PUT /api/promissorynotes/:id
// @access  Public
export const updatePromissoryNote = asyncHandler(async (req: Request, res: Response) => {
  const noteData = updatePromissoryNoteSchema.parse(req.body);
  const updatedNote = await PromissoryNote.findByIdAndUpdate(req.params.id, noteData, { new: true }).populate('supplier');
  if (updatedNote) {
    res.json(updatedNote);
  } else {
    res.status(404);
    throw new Error('Promissory Note not found');
  }
});

// @desc    Delete a promissory note
// @route   DELETE /api/promissorynotes/:id
// @access  Public
export const deletePromissoryNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await PromissoryNote.findByIdAndDelete(req.params.id);
  if (note) {
    res.json({ message: 'Deleted Promissory Note' });
  } else {
    res.status(404);
    throw new Error('Promissory Note not found');
  }
});
