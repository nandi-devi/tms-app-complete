import express from 'express';
import {
    getTruckHiringNotes,
    getTruckHiringNoteById,
    createTruckHiringNote,
    updateTruckHiringNote,
    deleteTruckHiringNote
} from '../controllers/truckHiringNoteController';

const router = express.Router();

router.get('/', getTruckHiringNotes);
router.get('/:id', getTruckHiringNoteById);
router.post('/', createTruckHiringNote);
router.put('/:id', updateTruckHiringNote);
router.delete('/:id', deleteTruckHiringNote);

export default router;
