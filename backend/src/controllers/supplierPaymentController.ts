import { Request, Response } from 'express';
import SupplierPayment from '../models/supplierPayment';

// @desc    Get all supplier payments
// @route   GET /api/supplierpayments
// @access  Public
export const getSupplierPayments = async (req: Request, res: Response) => {
  try {
    const payments = await SupplierPayment.find().populate('supplier').populate('relatedRental');
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single supplier payment
// @route   GET /api/supplierpayments/:id
// @access  Public
export const getSupplierPaymentById = async (req: Request, res: Response) => {
    try {
        const payment = await SupplierPayment.findById(req.params.id).populate('supplier').populate('relatedRental');
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find supplier payment' });
        }
        res.json(payment);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @desc    Create a supplier payment
// @route   POST /api/supplierpayments
// @access  Public
export const createSupplierPayment = async (req: Request, res: Response) => {
  const { supplier, amount, paymentDate, notes, relatedRental } = req.body;

  const payment = new SupplierPayment({
    supplier,
    amount,
    paymentDate,
    notes,
    relatedRental,
  });

  try {
    const newPayment = await payment.save();
    const populatedPayment = await SupplierPayment.findById(newPayment._id).populate('supplier').populate('relatedRental');
    res.status(201).json(populatedPayment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a supplier payment
// @route   PUT /api/supplierpayments/:id
// @access  Public
export const updateSupplierPayment = async (req: Request, res: Response) => {
    try {
        const updatedPayment = await SupplierPayment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplier').populate('relatedRental');
        if (updatedPayment == null) {
            return res.status(404).json({ message: 'Cannot find supplier payment' });
        }
        res.json(updatedPayment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a supplier payment
// @route   DELETE /api/supplierpayments/:id
// @access  Public
export const deleteSupplierPayment = async (req: Request, res: Response) => {
    try {
        const payment = await SupplierPayment.findByIdAndDelete(req.params.id);
        if (payment == null) {
            return res.status(404).json({ message: 'Cannot find supplier payment' });
        }
        res.json({ message: 'Deleted Supplier Payment' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
