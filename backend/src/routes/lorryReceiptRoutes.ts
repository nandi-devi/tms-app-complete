import express from 'express';
import { getLorryReceipts, createLorryReceipt } from '../controllers/lorryReceiptController';

const router = express.Router();

router.get('/', getLorryReceipts);
router.post('/', createLorryReceipt);

export default router;
