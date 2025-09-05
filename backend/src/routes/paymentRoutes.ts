import express from 'express';
import { getPayments, createPayment } from '../controllers/paymentController';

const router = express.Router();

router.get('/', getPayments);
router.post('/', createPayment);

export default router;
