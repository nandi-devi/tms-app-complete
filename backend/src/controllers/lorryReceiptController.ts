import { Request, Response } from 'express';
import LorryReceipt from '../models/lorryReceipt';

export const getLorryReceipts = async (req: Request, res: Response) => {
  try {
    const lorryReceipts = await LorryReceipt.find()
      .populate('consignor')
      .populate('consignee')
      .populate('vehicle');
    res.json(lorryReceipts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createLorryReceipt = async (req: Request, res: Response) => {
  const lorryReceipt = new LorryReceipt({
    date: req.body.date,
    reportingDate: req.body.reportingDate,
    deliveryDate: req.body.deliveryDate,
    consignor: req.body.consignorId,
    consignee: req.body.consigneeId,
    vehicle: req.body.vehicleId,
    from: req.body.from,
    to: req.body.to,
    packages: req.body.packages,
    charges: req.body.charges,
    totalAmount: req.body.totalAmount,
    eWayBillNo: req.body.eWayBillNo,
    valueGoods: req.body.valueGoods,
    gstPayableBy: req.body.gstPayableBy,
    status: req.body.status,
    insurance: req.body.insurance,
    invoiceNo: req.body.invoiceNo,
    sealNo: req.body.sealNo,
  });

  try {
    const newLorryReceipt = await lorryReceipt.save();
    res.status(201).json(newLorryReceipt);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
