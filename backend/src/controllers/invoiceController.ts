import { Request, Response } from 'express';
import Invoice from '../models/invoice';
import { getNextSequenceValue } from '../utils/sequence';
import { InvoiceStatus } from '../types';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('payments')
      .populate({
          path: 'lorryReceipts',
          populate: [
              { path: 'consignor' },
              { path: 'consignee' },
              { path: 'vehicle' }
          ]
      })
      .sort({ invoiceNumber: -1 });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('customer')
            .populate('payments')
            .populate({
                path: 'lorryReceipts',
                populate: [
                    { path: 'consignor' },
                    { path: 'consignee' },
                    { path: 'vehicle' }
                ]
            });
        if (invoice == null) {
            return res.status(404).json({ message: 'Cannot find invoice' });
        }
        res.json(invoice);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createInvoice = async (req: Request, res: Response) => {
  const { customerId, lorryReceipts, invoiceNumber, ...rest } = req.body;

  try {
    let finalInvoiceNumber: number;

    if (invoiceNumber) {
        const existingInvoice = await Invoice.findOne({ invoiceNumber: invoiceNumber });
        if (existingInvoice) {
            return res.status(409).json({ message: `Invoice number ${invoiceNumber} already exists.` });
        }
        finalInvoiceNumber = invoiceNumber;
    } else {
        finalInvoiceNumber = await getNextSequenceValue('invoiceId');
    }

    const invoice = new Invoice({
      ...rest,
      invoiceNumber: finalInvoiceNumber,
      customer: customerId,
      lorryReceipts: lorryReceipts.map((lr: any) => lr._id),
      status: InvoiceStatus.UNPAID,
    });

    const newInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(newInvoice._id)
        .populate('customer')
        .populate('payments')
        .populate({
            path: 'lorryReceipts',
            populate: [
                { path: 'consignor' },
                { path: 'consignee' },
                { path: 'vehicle' }
            ]
        });
    res.status(201).json(populatedInvoice);
  } catch (err: any) {
    if (err.code === 11000 && err.keyPattern?.invoiceNumber) {
        return res.status(409).json({ message: `Invoice number ${err.keyValue.invoiceNumber} already exists.` });
    }
    res.status(400).json({ message: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
    try {
        const { customerId, lorryReceipts, ...rest } = req.body;
        const updatedData = {
            ...rest,
            customer: customerId,
            lorryReceipts: lorryReceipts.map((lr: any) => lr._id),
        };
        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, updatedData, { new: true })
            .populate('customer')
            .populate('payments')
            .populate({
                path: 'lorryReceipts',
                populate: [
                    { path: 'consignor' },
                    { path: 'consignee' },
                    { path: 'vehicle' }
                ]
            });

        if (updatedInvoice == null) {
            return res.status(404).json({ message: 'Cannot find invoice' });
        }
        res.json(updatedInvoice);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (invoice == null) {
            return res.status(404).json({ message: 'Cannot find invoice' });
        }
        res.json({ message: 'Deleted Invoice' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
