import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Payment from '../models/payment';
import Invoice from '../models/invoice';
import TruckHiringNote from '../models/truckHiringNote';
import { updateInvoiceStatus } from '../utils/invoiceUtils';
import { updateThnStatus } from '../utils/thnUtils';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().populate('invoiceId').populate('truckHiringNoteId');
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
  const { invoiceId, truckHiringNoteId, ...paymentData } = req.body;

  if (!invoiceId && !truckHiringNoteId) {
    return res.status(400).json({ message: 'Either invoiceId or truckHiringNoteId is required.' });
  }

  try {
    const payment = new Payment({
      ...paymentData,
      invoiceId: invoiceId || undefined,
      truckHiringNoteId: truckHiringNoteId || undefined,
    });

    const newPayment = await payment.save();

    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.payments.push(newPayment._id);
        await invoice.save();
        await updateInvoiceStatus(invoiceId);
      }
    } else if (truckHiringNoteId) {
      const thn = await TruckHiringNote.findById(truckHiringNoteId);
      if (thn) {
        thn.payments.push(newPayment._id);
        await thn.save();
        await updateThnStatus(truckHiringNoteId);
      }
    }

    const populatedPayment = await Payment.findById(newPayment._id)
        .populate('invoiceId')
        .populate('truckHiringNoteId');

    res.status(201).json(populatedPayment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (updatedPayment == null) {
            return res.status(404).json({ message: 'Cannot find payment' });
        }

        if (updatedPayment.invoiceId) {
            await updateInvoiceStatus(updatedPayment.invoiceId.toString());
        } else if (updatedPayment.truckHiringNoteId) {
            await updateThnStatus(updatedPayment.truckHiringNoteId.toString());
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

        if (payment.invoiceId) {
            const invoiceId = payment.invoiceId.toString();
            await Invoice.findByIdAndUpdate(invoiceId, { $pull: { payments: payment._id } });
            await updateInvoiceStatus(invoiceId);
        } else if (payment.truckHiringNoteId) {
            const thnId = payment.truckHiringNoteId.toString();
            await TruckHiringNote.findByIdAndUpdate(thnId, { $pull: { payments: payment._id } });
            await updateThnStatus(thnId);
        }

        res.json({ message: 'Deleted Payment' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
