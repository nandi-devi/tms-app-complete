import express from 'express';
import { resetData, backupData, restoreData } from '../controllers/dataController';

const router = express.Router();

// @desc    Reset all application data
// @route   POST /api/data/reset
router.post('/reset', resetData);

// @desc    Backup all application data
// @route   GET /api/data/backup
router.get('/backup', backupData);

// @desc    Restore all application data from a backup
// @route   POST /api/data/restore
router.post('/restore', restoreData);

export default router;
