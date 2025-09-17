import express, { Request, Response } from 'express';
import { resetData, backupData, restoreData } from '../controllers/dataController';
import expressAsyncHandler from 'express-async-handler';
import NumberingConfig from '../models/numbering';

const router = express.Router();

// @desc    Reset all application data
// @route   POST /api/data/reset
router.post('/reset', resetData);

// @desc    Backup all application data
// @route   GET /api/data/backup
router.get('/backup', backupData);

// @desc    Restore application data from a backup
// @route   POST /api/data/restore
router.post('/restore', restoreData);

// Numbering config endpoints - updated for production
router.get('/numbering', expressAsyncHandler(async (req: Request, res: Response) => {
  const items = await NumberingConfig.find({});
  res.json(items);
}));

router.post('/numbering', expressAsyncHandler(async (req: Request, res: Response) => {
  const { key, start, end, allowOutsideRange } = req.body;
  if (!key || typeof start !== 'number' || typeof end !== 'number' || start > end) {
    res.status(400).json({ message: 'Invalid numbering configuration payload' });
    return;
  }
  const existing = await NumberingConfig.findById(key);
  if (existing) {
    existing.start = start;
    existing.end = end;
    // If current next is outside new range, reset to start
    existing.next = Math.max(start, Math.min(existing.next, end + 1));
    existing.allowOutsideRange = !!allowOutsideRange;
    await existing.save();
    res.json(existing);
    return;
  }
  const created = await NumberingConfig.create({ _id: key, start, end, next: start, allowOutsideRange: !!allowOutsideRange });
  res.status(201).json(created);
}));

export default router;
