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


dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: 'https://allindialo.netlify.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use Routes
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
