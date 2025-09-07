import express from 'express';
import {
  getPromissoryNotes,
  getPromissoryNoteById,
  createPromissoryNote,
  updatePromissoryNote,
  deletePromissoryNote,
} from '../controllers/promissoryNoteController';

const router = express.Router();

router.route('/')
  .get(getPromissoryNotes)
  .post(createPromissoryNote);

router.route('/:id')
  .get(getPromissoryNoteById)
  .put(updatePromissoryNote)
  .delete(deletePromissoryNote);

export default router;
