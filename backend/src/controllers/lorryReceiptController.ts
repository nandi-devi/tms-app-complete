import { Request, Response } from 'express';
import LorryReceipt from '../models/lorryReceipt';
import TruckRental from '../models/truckRental';
import { getNextSequenceValue } from '../utils/sequence';

export const getLorryReceipts = async (req: Request, res: Response) => {
  try {
    const lorryReceipts = await LorryReceipt.find()
      .populate('consignor')
      .populate('consignee')
      .populate('vehicle')
      .populate({ path: 'truckRental', populate: { path: 'supplier' } })
      .sort({ lrNumber: -1 }); // Sort by the new sequential ID
    res.json(lorryReceipts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getLorryReceiptById = async (req: Request, res: Response) => {
    try {
        const lorryReceipt = await LorryReceipt.findById(req.params.id)
            .populate('consignor')
            .populate('consignee')
            .populate('vehicle')
            .populate({ path: 'truckRental', populate: { path: 'supplier' } });
        if (lorryReceipt == null) {
            return res.status(404).json({ message: 'Cannot find lorry receipt' });
        }
        res.json(lorryReceipt);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createLorryReceipt = async (req: Request, res: Response) => {
  const { consignorId, consigneeId, vehicleId, truckRental, rentalUsageValue, ...rest } = req.body;

  try {
    let rentalCost = 0;
    if (truckRental && rentalUsageValue) {
        const rentalAgreement = await TruckRental.findById(truckRental);
        if (rentalAgreement) {
            rentalCost = rentalAgreement.rentalRate * rentalUsageValue;
        }
    }

    const nextLrNumber = await getNextSequenceValue('lorryReceiptId');
    const lorryReceipt = new LorryReceipt({
      ...rest,
      lrNumber: nextLrNumber,
      consignor: consignorId,
      consignee: consigneeId,
      vehicle: vehicleId,
      truckRental: truckRental || undefined,
      rentalUsageValue: rentalUsageValue || undefined,
      rentalCost: rentalCost || undefined,
    });

    const newLorryReceipt = await lorryReceipt.save();
    const populatedLr = await LorryReceipt.findById(newLorryReceipt._id)
        .populate('consignor')
        .populate('consignee')
        .populate('vehicle')
        .populate({ path: 'truckRental', populate: { path: 'supplier' } });
    res.status(201).json(populatedLr);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLorryReceipt = async (req: Request, res: Response) => {
    try {
        const { consignorId, consigneeId, vehicleId, truckRental, rentalUsageValue, ...rest } = req.body;

        let rentalCost = 0;
        if (truckRental && rentalUsageValue) {
            const rentalAgreement = await TruckRental.findById(truckRental);
            if (rentalAgreement) {
                rentalCost = rentalAgreement.rentalRate * rentalUsageValue;
            }
        }

        const updatedData = {
            ...rest,
            consignor: consignorId,
            consignee: consigneeId,
            vehicle: vehicleId,
            truckRental: truckRental || undefined,
            rentalUsageValue: rentalUsageValue || undefined,
            rentalCost: rentalCost || undefined,
        };
        const updatedLorryReceipt = await LorryReceipt.findByIdAndUpdate(req.params.id, updatedData, { new: true })
            .populate('consignor')
            .populate('consignee')
            .populate('vehicle')
            .populate({ path: 'truckRental', populate: { path: 'supplier' } });

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
