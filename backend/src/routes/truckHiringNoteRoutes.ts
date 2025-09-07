import express from 'express';
import {
    getTruckHiringNotes,
    getTruckHiringNoteById,
    createTruckHiringNote,
    updateTruckHiringNote
} from '../controllers/truckHiringNoteController';

const router = express.Router();

router.get('/', getTruckHiringNotes);
router.get('/:id', getTruckHiringNoteById);
router.post('/', createTruckHiringNote);
router.put('/:id', updateTruckHiringNote);

export default router;
