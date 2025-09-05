import { Request, Response } from 'express';
import Invoice from '../models/invoice';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('lorryReceipts');
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  const invoice = new Invoice({
    date: req.body.date,
    customer: req.body.customerId,
    lorryReceipts: req.body.lorryReceipts.map((lr: any) => lr.id),
    totalAmount: req.body.totalAmount,
    remarks: req.body.remarks,
    gstType: req.body.gstType,
    cgstRate: req.body.cgstRate,
    sgstRate: req.body.sgstRate,
    igstRate: req.body.igstRate,
    cgstAmount: req.body.cgstAmount,
    sgstAmount: req.body.sgstAmount,
    igstAmount: req.body.igstAmount,
    grandTotal: req.body.grandTotal,
    isRcm: req.body.isRcm,
    isManualGst: req.body.isManualGst,
  });

  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
