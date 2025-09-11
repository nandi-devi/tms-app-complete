import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import LorryReceipt from '../models/lorryReceipt';
import { LorryReceiptStatus } from '../types';

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
    cb(null, `${ts}-${Math.round(Math.random()*1e6)}${ext}`);
  }
});

const upload = multer({ storage });

export const uploadDelivery = [
  upload.array('photos', 4),
  async (req: Request, res: Response) => {
    try {
      const lrId = req.params.id;
      const { receiverName, receiverPhone, remarks, latitude, longitude, recordedBy } = req.body as any;

      const lr = await LorryReceipt.findById(lrId);
      if (!lr) return res.status(404).json({ message: 'Lorry Receipt not found' });

      const files = (req.files as Express.Multer.File[]) || [];
      const photos = files.map(f => `/uploads/pod/${lrId}/${path.basename(f.path)}`);

      lr.delivery = {
        deliveredAt: new Date().toISOString(),
        receiverName: receiverName || 'N/A',
        receiverPhone,
        remarks,
        photos,
        recordedBy,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      } as any;
      lr.status = LorryReceiptStatus.DELIVERED;

      await lr.save();
      const updated = await LorryReceipt.findById(lrId)
        .populate('consignor')
        .populate('consignee')
        .populate('vehicle');
      res.json(updated);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  }
];

export const getDelivery = async (req: Request, res: Response) => {
  try {
    const lr = await LorryReceipt.findById(req.params.id);
    if (!lr) return res.status(404).json({ message: 'Lorry Receipt not found' });
    res.json(lr.delivery || null);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


