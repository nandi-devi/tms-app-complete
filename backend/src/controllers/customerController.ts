import { Request, Response } from 'express';
import Customer from '../models/customer';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';
import Payment from '../models/payment';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Public
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer == null) {
            return res.status(404).json({ message: 'Cannot find customer' });
        }
        res.json(customer);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Public
export const createCustomer = async (req: Request, res: Response) => {
  const { name, tradeName, address, state, gstin, contactPerson, contactPhone, contactEmail } = req.body;

  try {
    // If gstin is provided, check for duplicates
    if (gstin) {
      const existingCustomer = await Customer.findOne({ gstin });
      if (existingCustomer) {
        return res.status(409).json({ message: `A client with GSTIN ${gstin} already exists.` });
      }
    }

    const customer = new Customer({
      name,
      tradeName,
      address,
      state,
      gstin,
      contactPerson,
      contactPhone,
      contactEmail,
    });

    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err: any) {
    // Handle potential duplicate key error from MongoDB if two requests come at the same time
    if (err.code === 11000 && err.keyPattern?.gstin) {
        return res.status(409).json({ message: `A client with GSTIN ${req.body.gstin} already exists.` });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Public
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedCustomer == null) {
            return res.status(404).json({ message: 'Cannot find customer' });
        }
        res.json(updatedCustomer);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Public
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;

        // Check if the customer is used in any Lorry Receipts
        const lrConsignorCount = await LorryReceipt.countDocuments({ consignor: customerId });
        const lrConsigneeCount = await LorryReceipt.countDocuments({ consignee: customerId });
        if (lrConsignorCount > 0 || lrConsigneeCount > 0) {
            return res.status(400).json({ message: 'Cannot delete client. They are associated with existing lorry receipts.' });
        }

        // Check if the customer is used in any Invoices
        const invoiceCount = await Invoice.countDocuments({ customer: customerId });
        if (invoiceCount > 0) {
            return res.status(400).json({ message: 'Cannot delete client. They are associated with existing invoices.' });
        }

        // Check if the customer is used in any Payments
        const paymentCount = await Payment.countDocuments({ customer: customerId });
        if (paymentCount > 0) {
            return res.status(400).json({ message: 'Cannot delete client. They are associated with existing payments.' });
        }

        const customer = await Customer.findByIdAndDelete(customerId);
        if (customer == null) {
            return res.status(404).json({ message: 'Cannot find customer' });
        }
        res.json({ message: 'Deleted Customer' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
