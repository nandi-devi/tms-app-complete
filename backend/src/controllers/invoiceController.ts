import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Invoice from '../models/invoice';
import LorryReceipt from '../models/lorryReceipt';
import { getNextSequenceValue } from '../utils/sequence';
import { LorryReceiptStatus, InvoiceStatus } from '../types';
import { invoiceListQuerySchema, createInvoiceSchema, updateInvoiceSchema } from '../utils/validation';
import mongoose from 'mongoose';

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
    console.log('=== INVOICE CREATION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Transform frontend data format to backend format before validation
    console.log('Original customerId:', req.body.customerId);
    console.log('Original customer:', req.body.customer);
    console.log('Original lorryReceipts:', req.body.lorryReceipts);
    
    const transformedData = {
      ...req.body,
      customer: req.body.customerId || req.body.customer,
      lorryReceipts: req.body.lorryReceipts?.map((lr: any) => lr._id || lr) || req.body.lorryReceipts,
    };
    
    // Remove frontend-specific fields
    delete transformedData.customerId;
    
    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
    console.log('Transformed customer:', transformedData.customer);
    console.log('Transformed lorryReceipts:', transformedData.lorryReceipts);
    
    // Check database connection
    console.log('Database connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    
    console.log('About to validate with schema...');
    try {
      const invoiceData = createInvoiceSchema.parse(transformedData);
      console.log('Validation successful! Validated data:', JSON.stringify(invoiceData, null, 2));
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      console.error('Validation error details:', JSON.stringify(validationError, null, 2));
      throw validationError;
    }
    
    const invoiceData = createInvoiceSchema.parse(transformedData);
    
    // Use custom Invoice number if provided, otherwise generate one
    let invoiceNumber;
    if (invoiceData.invoiceNumber) {
      invoiceNumber = invoiceData.invoiceNumber;
      console.log('Using custom Invoice number:', invoiceNumber);
    } else {
      try {
        invoiceNumber = await getNextSequenceValue('invoice');
        console.log('Generated Invoice number:', invoiceNumber);
      } catch (seqError) {
        console.error('Sequence generation error:', seqError);
        // Fallback to timestamp-based number
        invoiceNumber = Date.now();
        console.log('Using fallback Invoice number:', invoiceNumber);
      }
    }
    
    // Ensure all required fields are present
    const invoiceToCreate = {
      ...invoiceData,
      invoiceNumber,
      status: InvoiceStatus.UNPAID,
      // Ensure these fields have default values if not provided
      isRcm: invoiceData.isRcm || false,
      isManualGst: invoiceData.isManualGst || false,
      remarks: invoiceData.remarks || '',
    };
    
    console.log('Invoice to create:', JSON.stringify(invoiceToCreate, null, 2));
    
    console.log('Creating new Invoice instance...');
    const invoice = new Invoice(invoiceToCreate);
    console.log('Invoice instance created');

    console.log('Saving invoice to database...');
    const createdInvoice = await invoice.save();
    console.log('Invoice saved successfully:', createdInvoice._id);
    
    // Populate the created invoice before sending response
    const populatedInvoice = await Invoice.findById(createdInvoice._id)
      .populate('customer')
      .populate('lorryReceipts');
    console.log('Populated Invoice:', populatedInvoice?._id);

    // Update status of associated lorry receipts
    if (invoiceData.lorryReceipts && invoiceData.lorryReceipts.length > 0) {
      await LorryReceipt.updateMany(
        { _id: { $in: invoiceData.lorryReceipts } },
        { $set: { status: LorryReceiptStatus.INVOICED } }
      );
      console.log('Updated LR statuses for invoice');
    }

    res.status(201).json(populatedInvoice || createdInvoice);
  } catch (error) {
    console.error('=== INVOICE CREATION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
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
