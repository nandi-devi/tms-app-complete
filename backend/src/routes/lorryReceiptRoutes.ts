import express from 'express';
import {
    getLorryReceipts,
    createLorryReceipt,
    getLorryReceiptById,
    updateLorryReceipt,
    deleteLorryReceipt
} from '../controllers/lorryReceiptController';

const router = express.Router();

router.route('/')
    .get(getLorryReceipts)
    .post(createLorryReceipt);

router.route('/:id')
    .get(getLorryReceiptById)
    .put(updateLorryReceipt)
    .delete(deleteLorryReceipt);

export default router;
