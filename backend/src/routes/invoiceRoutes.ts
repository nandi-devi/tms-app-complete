import express from 'express';
import { getInvoices, createInvoice } from '../controllers/invoiceController';

const router = express.Router();

router.get('/', getInvoices);
router.post('/', createInvoice);

export default router;
