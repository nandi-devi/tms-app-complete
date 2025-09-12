import { Request, Response } from 'express';
import LorryReceipt from '../models/lorryReceipt';
import { getNextSequenceValue } from '../utils/sequence';
import NumberingConfig from '../models/numbering';
import { lrListQuerySchema, createLrSchema, updateLrSchema } from '../utils/validation';

export const getLorryReceipts = async (req: Request, res: Response) => {
  try {
    const parsed = lrListQuerySchema.safeParse(req.query);
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
    if (customerId) {
      query.$or = [{ consignor: customerId }, { consignee: customerId }];
    }
    if (status) query.status = status;
    if (search) {
      const asNum = Number(search);
      if (!isNaN(asNum)) query.lrNumber = asNum;
      else query.$text = { $search: search };
    }

    const [items, total] = await Promise.all([
      LorryReceipt.find(query)
        .populate('consignor')
        .populate('consignee')
        .populate('vehicle')
        .sort({ lrNumber: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      LorryReceipt.countDocuments(query)
    ]);

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

export const getLorryReceiptById = async (req: Request, res: Response) => {
    try {
        const lorryReceipt = await LorryReceipt.findById(req.params.id)
            .populate('consignor')
            .populate('consignee')
        .populate('vehicle');
        if (lorryReceipt == null) {
            return res.status(404).json({ message: 'Cannot find lorry receipt' });
        }
        res.json(lorryReceipt);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createLorryReceipt = async (req: Request, res: Response) => {
  const parsed = createLrSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }
  const { consignorId, consigneeId, vehicleId, lrNumber: customLrNumber, ...rest } = parsed.data as any;

  try {
    let lrNumberToUse: number;
    if (typeof customLrNumber === 'number' && !isNaN(customLrNumber)) {
      const cfg = await NumberingConfig.findById('lorryReceiptId');
      if (cfg && !cfg.allowOutsideRange) {
        if (customLrNumber < cfg.start || customLrNumber > cfg.end) {
          return res.status(400).json({ message: `LR number must be within range ${cfg.start}-${cfg.end}` });
        }
      }
      // Ensure uniqueness
      const exists = await LorryReceipt.findOne({ lrNumber: customLrNumber });
      if (exists) return res.status(400).json({ message: 'LR number already exists' });
      lrNumberToUse = customLrNumber;
    } else {
      lrNumberToUse = await getNextSequenceValue('lorryReceiptId');
    }
    const lorryReceipt = new LorryReceipt({
      ...rest,
      lrNumber: lrNumberToUse,
      consignor: consignorId,
      consignee: consigneeId,
      vehicle: vehicleId,
    });

    const newLorryReceipt = await lorryReceipt.save();
    const populatedLr = await LorryReceipt.findById(newLorryReceipt._id)
        .populate('consignor')
        .populate('consignee')
        .populate('vehicle');
    res.status(201).json(populatedLr);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLorryReceipt = async (req: Request, res: Response) => {
    try {
        const parsed = updateLrSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
        }
        const { consignorId, consigneeId, vehicleId, ...rest } = parsed.data as any;

        const updatedData = {
            ...rest,
            consignor: consignorId,
            consignee: consigneeId,
            vehicle: vehicleId,
        };
        const updatedLorryReceipt = await LorryReceipt.findByIdAndUpdate(req.params.id, updatedData, { new: true })
            .populate('consignor')
            .populate('consignee')
            .populate('vehicle');

        if (updatedLorryReceipt == null) {
            return res.status(404).json({ message: 'Cannot find lorry receipt' });
        }
        res.json(updatedLorryReceipt);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteLorryReceipt = async (req: Request, res: Response) => {
    try {
        // TODO: Check if this LR is part of an invoice before deleting
        const lorryReceipt = await LorryReceipt.findByIdAndDelete(req.params.id);
        if (lorryReceipt == null) {
            return res.status(404).json({ message: 'Cannot find lorry receipt' });
        }
        res.json({ message: 'Deleted Lorry Receipt' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
