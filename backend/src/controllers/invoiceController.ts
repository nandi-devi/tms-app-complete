import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Invoice from '../models/invoice';
import LorryReceipt from '../models/lorryReceipt';
import { getNextSequenceValue } from '../utils/sequence';
import { LorryReceiptStatus, InvoiceStatus } from '../types';
import { invoiceListQuerySchema, createInvoiceSchema, updateInvoiceSchema } from '../utils/validation';

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', ...filters } = invoiceListQuerySchema.parse(req.query);

  const query: any = {};
  if (filters.startDate) query.date = { ...query.date, $gte: new Date(filters.startDate) };
  if (filters.endDate) query.date = { ...query.date, $lte: new Date(filters.endDate) };
  if (filters.customerId) query.customer = filters.customerId;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { invoiceNumber: { $regex: filters.search, $options: 'i' } },
      { 'customer.name': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const items = await Invoice.find(query)
    .populate('customer')
    .populate('lorryReceipts')
    .populate('payments')
    .sort({ invoiceNumber: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Invoice.countDocuments(query);

  res.json({ items, total, page: pageNum, limit: limitNum });
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer')
    .populate('lorryReceipts')
    .populate('payments');

  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Received Invoice data:', JSON.stringify(req.body, null, 2));
    
    // Transform frontend data format to backend format before validation
    const transformedData = {
      ...req.body,
      customer: req.body.customerId || req.body.customer,
      lorryReceipts: req.body.lorryReceipts?.map((lr: any) => lr._id || lr) || req.body.lorryReceipts,
    };
    
    // Remove frontend-specific fields
    delete transformedData.customerId;
    
    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
    
    const invoiceData = createInvoiceSchema.parse(transformedData);
    console.log('Validated data:', JSON.stringify(invoiceData, null, 2));
    
    // Use custom Invoice number if provided, otherwise generate one
    const invoiceNumber = invoiceData.invoiceNumber || await getNextSequenceValue('invoiceId');
    console.log('Using Invoice number:', invoiceNumber);
    
    const invoice = new Invoice({
      ...invoiceData,
      invoiceNumber,
      status: InvoiceStatus.UNPAID,
    });

    const createdInvoice = await invoice.save();
    console.log('Saved Invoice:', createdInvoice._id);

    // Update status of associated lorry receipts
    await LorryReceipt.updateMany(
      { _id: { $in: invoiceData.lorryReceipts } },
      { $set: { status: LorryReceiptStatus.INVOICED } }
    );

    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error('Error creating Invoice:', error);
    
    // Handle validation errors specifically
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors: { [key: string]: string[] } = {};
      if ((error as any).errors) {
        Object.keys((error as any).errors).forEach(key => {
          validationErrors[key] = [(error as any).errors[key].message];
        });
      }
      
      res.status(400).json({
        message: 'Validation failed',
        errors: {
          fieldErrors: validationErrors
        }
      });
      return;
    }
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodErrors: { [key: string]: string[] } = {};
      if ((error as any).issues) {
        (error as any).issues.forEach((issue: any) => {
          const field = issue.path.join('.');
          if (!zodErrors[field]) zodErrors[field] = [];
          zodErrors[field].push(issue.message);
        });
      }
      
      res.status(400).json({
        message: 'Validation failed',
        errors: {
          fieldErrors: zodErrors
        }
      });
      return;
    }
    
    res.status(500).json({ 
      message: 'Failed to create invoice', 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });
  }
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  // Transform frontend data format to backend format before validation
  const transformedData = {
    ...req.body,
    customer: req.body.customerId || req.body.customer,
    lorryReceipts: req.body.lorryReceipts?.map((lr: any) => lr._id || lr) || req.body.lorryReceipts,
  };
  
  // Remove frontend-specific fields
  delete transformedData.customerId;
  
  const invoiceData = updateInvoiceSchema.parse(transformedData);
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    const originalLrIds = invoice.lorryReceipts.map(lr => lr.toString());

    Object.assign(invoice, invoiceData);
    const updatedInvoice = await invoice.save();

    const newLrIds = updatedInvoice.lorryReceipts.map(lr => lr.toString());

    // LRs to be marked as invoiced
    const toInvoice = newLrIds.filter(id => !originalLrIds.includes(id));
    if (toInvoice.length > 0) {
      await LorryReceipt.updateMany(
        { _id: { $in: toInvoice } },
        { $set: { status: LorryReceiptStatus.INVOICED } }
      );
    }

    // LRs to be marked as created (or other status)
    const toUnInvoice = originalLrIds.filter(id => !newLrIds.includes(id));
    if (toUnInvoice.length > 0) {
      await LorryReceipt.updateMany(
        { _id: { $in: toUnInvoice } },
        { $set: { status: LorryReceiptStatus.CREATED } } // Or whatever default status is appropriate
      );
    }

    res.json(updatedInvoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    if (invoice.payments && invoice.payments.length > 0) {
      res.status(400);
      throw new Error('Cannot delete an invoice with payments.');
    }

    const lrIds = invoice.lorryReceipts.map(lr => lr.toString());

    await invoice.deleteOne();

    // Update status of associated lorry receipts
    await LorryReceipt.updateMany(
      { _id: { $in: lrIds } },
      { $set: { status: LorryReceiptStatus.CREATED } } // Or whatever default status is appropriate
    );

    res.json({ message: 'Invoice removed' });
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});
