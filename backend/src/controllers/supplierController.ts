import { Request, Response } from 'express';
import Supplier from '../models/supplier';
import LorryReceipt from '../models/lorryReceipt';
import SupplierPayment from '../models/supplierPayment';
import mongoose from 'mongoose';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Public
export const getSupplierById = async (req: Request, res: Response) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (supplier == null) {
            return res.status(404).json({ message: 'Cannot find supplier' });
        }
        res.json(supplier);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Public
export const createSupplier = async (req: Request, res: Response) => {
  const { name, contactPerson, email, phone, paymentTerms, notes } = req.body;

  const supplier = new Supplier({
    name,
    contactPerson,
    email,
    phone,
    paymentTerms,
    notes,
  });

  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Public
export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedSupplier == null) {
            return res.status(404).json({ message: 'Cannot find supplier' });
        }
        res.json(updatedSupplier);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Public
export const deleteSupplier = async (req: Request, res: Response) => {
    try {
        const supplierId = req.params.id;

        // TODO: Add check here to prevent deletion if supplier is linked to truck rentals

        const supplier = await Supplier.findByIdAndDelete(supplierId);
        if (supplier == null) {
            return res.status(404).json({ message: 'Cannot find supplier' });
        }
        res.json({ message: 'Deleted Supplier' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get dues summary for all suppliers
// @route   GET /api/suppliers/dues-summary
// @access  Public
export const getSupplierDuesSummary = async (req: Request, res: Response) => {
    try {
        const duesBySupplier = await LorryReceipt.aggregate([
            { $match: { rentalCost: { $exists: true, $gt: 0 } } },
            { $lookup: { from: 'truckrentals', localField: 'truckRental', foreignField: '_id', as: 'rentalInfo' } },
            { $unwind: '$rentalInfo' },
            { $group: { _id: '$rentalInfo.supplier', totalRentalCost: { $sum: '$rentalCost' } } },
            { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierInfo' } },
            { $unwind: '$supplierInfo' },
            { $project: { supplier: '$supplierInfo', totalRentalCost: 1, _id: 0 } }
        ]);

        const paymentsBySupplier = await SupplierPayment.aggregate([
            { $group: { _id: '$supplier', totalPaid: { $sum: '$amount' } } }
        ]);

        const paymentsMap = new Map(paymentsBySupplier.map(p => [p._id.toString(), p.totalPaid]));

        const summary = duesBySupplier.map(due => {
            const totalPaid = paymentsMap.get(due.supplier._id.toString()) || 0;
            return {
                ...due,
                totalPaid,
                balance: due.totalRentalCost - totalPaid
            };
        });

        res.json(summary);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// @desc    Get dues for a single supplier
// @route   GET /api/suppliers/:id/dues
// @access  Public
export const getSupplierDues = async (req: Request, res: Response) => {
    try {
        const supplierId = new mongoose.Types.ObjectId(req.params.id);

        // 1. Calculate total rental costs from LorryReceipts
        const rentalCosts = await LorryReceipt.aggregate([
            { $lookup: { from: 'truckrentals', localField: 'truckRental', foreignField: '_id', as: 'rentalInfo' } },
            { $unwind: '$rentalInfo' },
            { $match: { 'rentalInfo.supplier': supplierId } },
            { $group: { _id: null, total: { $sum: '$rentalCost' } } }
        ]);
        const totalRentalCost = rentalCosts.length > 0 ? rentalCosts[0].total : 0;

        // 2. Calculate total payments made to the supplier
        const payments = await SupplierPayment.aggregate([
            { $match: { supplier: supplierId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPaid = payments.length > 0 ? payments[0].total : 0;

        // 3. Get all individual transactions for the ledger view
        const populatedLorryReceipts = await LorryReceipt.find()
            .populate({
                path: 'truckRental',
                match: { supplier: supplierId },
                populate: { path: 'truck' }
            });

        const rentalTransactions = populatedLorryReceipts
            .filter(lr => lr.truckRental) // Filter out LRs where the rental didn't match the supplier
            .map(lr => ({
                type: 'debit',
                date: lr.date,
                id: `lr-${lr._id}`,
                particulars: `Rental for Truck ${(lr.truckRental as any).truck.number} (LR #${lr.lrNumber})`,
                amount: lr.rentalCost || 0,
            }));

        const supplierPayments = await SupplierPayment.find({ supplier: supplierId });
        const paymentTransactions = supplierPayments.map(p => ({
            type: 'credit',
            date: p.paymentDate,
            id: `payment-${p._id}`,
            particulars: `Payment. ${p.notes || ''}`,
            amount: p.amount,
        }));

        const transactions = [...rentalTransactions, ...paymentTransactions]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        res.json({
            totalRentalCost,
            totalPaid,
            balance: totalRentalCost - totalPaid,
            transactions,
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
