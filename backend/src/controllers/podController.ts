import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import LorryReceipt from '../models/lorryReceipt';
import { LorryReceiptStatus } from '../types';
import { podUploadSchema } from '../utils/validation';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const lrId = req.params.id;
    const uploadsRoot = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    const dest = path.join(uploadsRoot, 'pod', lrId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `${ts}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({ storage });

export const uploadDelivery = [
  upload.array('photos', 4),
  asyncHandler(async (req: Request, res: Response) => {
    const lrId = req.params.id;
    const deliveryData = podUploadSchema.parse(req.body);

    const lr = await LorryReceipt.findById(lrId);
    if (!lr) {
      res.status(404);
      throw new Error('Lorry Receipt not found');
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const photos = files.map(f => `/uploads/pod/${lrId}/${path.basename(f.path)}`);

    lr.delivery = {
      ...deliveryData,
      deliveredAt: new Date().toISOString(),
      photos,
    } as any;
    lr.status = LorryReceiptStatus.DELIVERED;

    await lr.save();
    const updated = await LorryReceipt.findById(lrId)
      .populate('consignor')
      .populate('consignee')
      .populate('vehicle');
    res.json(updated);
  })
];

export const getDelivery = asyncHandler(async (req: Request, res: Response) => {
  const lr = await LorryReceipt.findById(req.params.id);
  if (!lr) {
    res.status(404);
    throw new Error('Lorry Receipt not found');
  }
  res.json(lr.delivery || null);
});


