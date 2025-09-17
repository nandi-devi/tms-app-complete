import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Payment from '../models/payment';
import Invoice from '../models/invoice';
import TruckHiringNote from '../models/truckHiringNote';
import { updateInvoiceStatus } from '../utils/invoiceUtils';
// THN status update function
const updateThnStatus = async (thnId: string) => {
  const thn = await TruckHiringNote.findById(thnId);
  if (thn) {
    const totalPaid = await Payment.aggregate([
      { $match: { truckHiringNoteId: thnId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
    const balanceAmount = thn.freightRate + (thn.additionalCharges || 0) - paidAmount;
    
    let status = 'UNPAID';
    if (balanceAmount <= 0) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }
    
    await TruckHiringNote.findByIdAndUpdate(thnId, { 
      paidAmount, 
      balanceAmount, 
      status 
    });
  }
};
import { createPaymentSchema, updatePaymentSchema } from '../utils/validation';

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await Payment.find()
    .populate({
      path: 'invoiceId',
      populate: {
        path: 'customer',
        model: 'Customer'
      }
    })
    .populate('truckHiringNoteId');
  res.json(payments);
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id).populate('invoiceId');
  if (payment) {
    res.json(payment);
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const paymentData = createPaymentSchema.parse(req.body);
  const { invoiceId, truckHiringNoteId } = paymentData;

  const payment = new Payment(paymentData);
  const newPayment = await payment.save();

  if (invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (invoice) {
      invoice.payments.push(newPayment._id as any);
      await invoice.save();
      await updateInvoiceStatus(invoiceId);
    }
  } else if (truckHiringNoteId) {
    const thn = await TruckHiringNote.findById(truckHiringNoteId);
    if (thn) {
      thn.payments.push(newPayment._id as any);
      await thn.save();
      await updateThnStatus(truckHiringNoteId);
    }
  }

  const populatedPayment = await Payment.findById(newPayment._id)
    .populate('invoiceId')
    .populate('truckHiringNoteId');

  res.status(201).json(populatedPayment);
});

export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
  const paymentData = updatePaymentSchema.parse(req.body);
  const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, paymentData, { new: true });

  if (!updatedPayment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (updatedPayment.invoiceId) {
    await updateInvoiceStatus(updatedPayment.invoiceId.toString());
  } else if (updatedPayment.truckHiringNoteId) {
    await updateThnStatus(updatedPayment.truckHiringNoteId.toString());
  }

  res.json(updatedPayment);
});

export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
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
});
