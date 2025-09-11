import { Request, Response } from 'express';
import Invoice from '../models/invoice';
import { getNextSequenceValue } from '../utils/sequence';
import { InvoiceStatus } from '../types';
import { invoiceListQuerySchema, createInvoiceSchema, updateInvoiceSchema } from '../utils/validation';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const parsed = invoiceListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid query', errors: parsed.error.flatten() });
    }
    const { page = '1', limit = '20', startDate, endDate, customerId, status, search } = parsed.data as any;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);

    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (search) {
      // Search by invoiceNumber via regex on string form not efficient; better to try numeric
      const asNum = Number(search);
      if (!isNaN(asNum)) query.invoiceNumber = asNum;
      // Client name search would require join; keep client-side for now
    }

    const [items, total] = await Promise.all([
      Invoice.find(query)
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
        .sort({ invoiceNumber: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Invoice.countDocuments(query)
    ]);

    // Backward compatibility: if no explicit pagination requested, return array only
    const paginationRequested = typeof req.query.page !== 'undefined' || typeof req.query.limit !== 'undefined';
    if (paginationRequested) {
      res.json({ items, total, page: pageNum, limit: limitNum });
    } else {
      res.json(items);
    }
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
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }
  const { customerId, lorryReceipts, ...rest } = parsed.data;

  try {
    const nextInvoiceNumber = await getNextSequenceValue('invoiceId');
    const invoice = new Invoice({
      ...rest,
      invoiceNumber: nextInvoiceNumber,
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
    res.status(400).json({ message: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
    try {
        const parsed = updateInvoiceSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        }
        const { customerId, lorryReceipts, ...rest } = parsed.data as any;
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
