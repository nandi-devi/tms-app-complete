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

export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('customer');
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }
        res.json(payment);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createPayment = async (req: Request, res: Response) => {
  const { customerId, ...rest } = req.body;
  const payment = new Payment({
    ...rest,
    customer: customerId,
  });

  try {
    const newPayment = await payment.save();
    const populatedPayment = await Payment.findById(newPayment._id).populate('customer');
    res.status(201).json(populatedPayment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const { customerId, ...rest } = req.body;
        const updatedData = {
            ...rest,
            customer: customerId,
        };
        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, updatedData, { new: true }).populate('customer');

        if (updatedPayment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }
        res.json(updatedPayment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }
        res.json({ message: 'Deleted Payment' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
