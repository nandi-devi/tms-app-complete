import express from 'express';
import {
    getLorryReceipts,
    createLorryReceipt,
    getLorryReceiptById,
    updateLorryReceipt,
    deleteLorryReceipt
} from '../controllers/lorryReceiptController';
import { Router } from 'express';
import { uploadDelivery, getDelivery } from '../controllers/podController';

const router = express.Router();

router.route('/')
    .get(getLorryReceipts)
    .post(createLorryReceipt);

router.route('/:id')
    .get(getLorryReceiptById)
    .put(updateLorryReceipt)
    .delete(deleteLorryReceipt);

// POD (Proof of Delivery)
router.post('/:id/delivery', uploadDelivery);
router.get('/:id/delivery', getDelivery);

export default router;
