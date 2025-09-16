import express from 'express';
import { generateToken } from '../middleware/auth';
import { hashPassword } from '../utils/auth';

const router = express.Router();

// Simple password-based authentication
const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // SHA-256 of empty string

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the provided password
    const hashedPassword = await hashPassword(password);
    
    // For now, we'll use a simple password check
    // In production, you should store this in a database
    if (hashedPassword === APP_PASSWORD_HASH) {
      const token = generateToken({ userId: 'admin', role: 'admin' });
      res.json({ 
        success: true, 
        token,
        message: 'Login successful' 
      });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @desc    Verify token
// @route   GET /api/auth/verify
router.get('/verify', (req, res) => {
  res.json({ message: 'Token is valid' });
});

export default router;
