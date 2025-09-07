import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Payment from '../models/payment';
import Invoice from '../models/invoice';
import { updateInvoiceStatus } from '../utils/invoiceUtils';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().populate('invoiceId');
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('invoiceId');
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }
        res.json(payment);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createPayment = async (req: Request, res: Response) => {
  const { invoiceId, amount, date, type, mode, referenceNo, notes } = req.body;

  if (!invoiceId || !Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({ message: 'Invalid or missing invoice ID' });
  }

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payment = new Payment({
      invoiceId,
      amount,
      date,
      type,
      mode,
      referenceNo,
      notes,
    });

    const newPayment = await payment.save();

    invoice.payments.push(newPayment._id as Types.ObjectId);
    await invoice.save();

    await updateInvoiceStatus(invoiceId);

    const populatedPayment = await Payment.findById(newPayment._id).populate('invoiceId');
    res.status(201).json(populatedPayment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('invoiceId');

        if (updatedPayment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }

        if (updatedPayment.invoiceId) {
            await updateInvoiceStatus(updatedPayment.invoiceId.toString());
        }

        res.json(updatedPayment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }

        if (payment.invoiceId) {
            const invoiceId = payment.invoiceId.toString();

            // Remove payment from invoice's payments array
            await Invoice.findByIdAndUpdate(invoiceId, { $pull: { payments: payment._id } });

            await payment.deleteOne();
            await updateInvoiceStatus(invoiceId);
        } else {
            await payment.deleteOne();
        }

        res.json({ message: 'Deleted Payment' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
