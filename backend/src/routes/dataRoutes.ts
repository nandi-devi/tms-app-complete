import express from 'express';
import { resetData, loadMockData } from '../controllers/dataController';

const router = express.Router();

// @desc    Reset all application data
// @route   POST /api/data/reset
router.post('/reset', resetData);

// @desc    Load mock data into the application
// @route   POST /api/data/load-mock
router.post('/load-mock', loadMockData);

export default router;
