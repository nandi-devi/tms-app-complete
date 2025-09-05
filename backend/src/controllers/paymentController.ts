import { Request, Response } from 'express';
import Payment from '../models/payment';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().populate('customer');
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  const payment = new Payment({
    customer: req.body.customerId,
    date: req.body.date,
    amount: req.body.amount,
    type: req.body.type,
    mode: req.body.mode,
    referenceNo: req.body.referenceNo,
    notes: req.body.notes,
  });

  try {
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
