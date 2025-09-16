import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import customerRoutes from './routes/customerRoutes';

import vehicleRoutes from './routes/vehicleRoutes';


import lorryReceiptRoutes from './routes/lorryReceiptRoutes';


import invoiceRoutes from './routes/invoiceRoutes';


import paymentRoutes from './routes/paymentRoutes';
import dataRoutes from './routes/dataRoutes';
import truckHiringNoteRoutes from './routes/truckHiringNoteRoutes';
import authRoutes from './routes/authRoutes';


dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'https://tms-app-ist1.onrender.com'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Static serving for uploaded POD images (supports persistent disk via UPLOADS_DIR)
import path from 'path';
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('API is running...');
});

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/lorryreceipts', lorryReceiptRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/truckhiringnotes', truckHiringNoteRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
