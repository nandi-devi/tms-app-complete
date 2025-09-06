import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Payment from '../models/payment';
import Invoice from '../models/invoice';
import { updateInvoiceStatus } from '../utils/invoiceUtils';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().populate('invoice').populate('customer');
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('invoice').populate('customer');
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }
        res.json(payment);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createPayment = async (req: Request, res: Response) => {
  const { invoiceId, customerId, amount, date, type, mode, referenceNo, notes } = req.body;

  if (invoiceId && !Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({ message: 'Invalid invoice ID' });
  }
  if (!invoiceId && !Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ message: 'Customer ID is required for on-account payments' });
  }

  try {
    let customerForPayment: any;

    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      customerForPayment = invoice.customer;
    } else {
      customerForPayment = customerId;
    }

    const payment = new Payment({
      invoice: invoiceId,
      customer: customerForPayment,
      amount,
      date,
      type,
      mode,
      referenceNo,
      notes,
    });

    const newPayment = await payment.save();

    if (invoiceId) {
      await updateInvoiceStatus(invoiceId);
    }

    const populatedPayment = await Payment.findById(newPayment._id).populate('invoice').populate('customer');
    res.status(201).json(populatedPayment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('invoice').populate('customer');

        if (updatedPayment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }

        if (updatedPayment.invoice) {
            await updateInvoiceStatus(updatedPayment.invoice.toString());
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

        if (payment.invoice) {
            const invoiceId = payment.invoice.toString();
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
