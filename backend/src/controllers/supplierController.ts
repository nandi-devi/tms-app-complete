import { Request, Response } from 'express';
import Supplier from '../models/supplier';

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
