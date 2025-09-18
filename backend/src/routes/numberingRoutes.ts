import express, { Request, Response } from 'express';
import NumberingConfig from '../models/numbering';

const router = express.Router();

// Get all numbering configurations
router.get('/configs', async (req: Request, res: Response) => {
  try {
    const configs = await NumberingConfig.find({});
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching numbering configs' });
  }
});

// Create or update numbering configuration
router.post('/configs', async (req: Request, res: Response) => {
  try {
    const { type, prefix, startNumber, endNumber, allowManualEntry, allowOutsideRange } = req.body;
    
    if (!type || !prefix || typeof startNumber !== 'number' || typeof endNumber !== 'number') {
      return res.status(400).json({ message: 'Invalid configuration data' });
    }

    if (startNumber > endNumber) {
      return res.status(400).json({ message: 'Start number must be less than or equal to end number' });
    }

    const existingConfig = await NumberingConfig.findOne({ type });
    
    if (existingConfig) {
      existingConfig.prefix = prefix;
      existingConfig.startNumber = startNumber;
      existingConfig.endNumber = endNumber;
      existingConfig.allowManualEntry = !!allowManualEntry;
      existingConfig.allowOutsideRange = !!allowOutsideRange;
      
      // Reset current number to start number when range is updated
      // This ensures the numbering starts from the new range
      existingConfig.currentNumber = startNumber;
      
      await existingConfig.save();
      res.json(existingConfig);
    } else {
      const newConfig = await NumberingConfig.create({
        type,
        prefix,
        startNumber,
        endNumber,
        currentNumber: startNumber,
        allowManualEntry: !!allowManualEntry,
        allowOutsideRange: !!allowOutsideRange,
      });
      res.status(201).json(newConfig);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving numbering config' });
  }
});

// Update current number
router.post('/update-current', async (req: Request, res: Response) => {
  try {
    const { type, currentNumber } = req.body;
    
    if (!type || typeof currentNumber !== 'number') {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const config = await NumberingConfig.findOne({ type });
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    config.currentNumber = currentNumber;
    await config.save();
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating current number' });
  }
});

// Get next number for a type
router.get('/next/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const config = await NumberingConfig.findOne({ type });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    if (config.currentNumber > config.endNumber && !config.allowOutsideRange) {
      return res.status(400).json({ message: 'Number range exhausted' });
    }

    const nextNumber = config.currentNumber;
    const formattedNumber = `${config.prefix}${nextNumber.toString().padStart(6, '0')}`;

    // Update current number
    config.currentNumber = nextNumber + 1;
    await config.save();

    res.json({ number: formattedNumber, currentNumber: config.currentNumber });
  } catch (error) {
    res.status(500).json({ message: 'Error getting next number' });
  }
});

export default router;
