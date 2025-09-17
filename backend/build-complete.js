const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting complete build process...');

// Clean dist directory
if (fs.existsSync('./dist')) {
  console.log('Cleaning dist directory...');
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Create dist directory
console.log('Creating dist directory...');
fs.mkdirSync('./dist', { recursive: true });

// Create complete JavaScript files
console.log('Creating complete JavaScript files...');

// Create config/database.js
const databaseJs = `const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/all-india-logistics');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
    console.log('✅ Data will be persisted to MongoDB database.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;`;

fs.mkdirSync('./dist/config', { recursive: true });
fs.writeFileSync('./dist/config/database.js', databaseJs);

// Create models
fs.mkdirSync('./dist/models', { recursive: true });

const customerModel = `const { Schema, model } = require('mongoose');

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  tradeName: { type: String },
  address: { type: String, required: true },
  state: { type: String, required: true },
  gstin: { type: String },
  contactPerson: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  city: { type: String },
  pin: { type: String },
  phone: { type: String },
  email: { type: String },
});

module.exports = model('Customer', CustomerSchema);`;

fs.writeFileSync('./dist/models/customer.js', customerModel);

const vehicleModel = `const { Schema, model } = require('mongoose');

const VehicleSchema = new Schema({
  number: { type: String, required: true, unique: true },
  vehicleNumber: { type: String },
  driverName: { type: String },
  driverPhone: { type: String },
});

module.exports = model('Vehicle', VehicleSchema);`;

fs.writeFileSync('./dist/models/vehicle.js', vehicleModel);

const invoiceModel = `const { Schema, model } = require('mongoose');

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  lorryReceipts: [{ type: Schema.Types.ObjectId, ref: 'LorryReceipt' }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['UNPAID', 'PAID', 'PARTIAL'], default: 'UNPAID' },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  paymentDate: { type: String },
  paymentMethod: { type: String },
  remarks: { type: String },
});

module.exports = model('Invoice', InvoiceSchema);`;

fs.writeFileSync('./dist/models/invoice.js', invoiceModel);

const lorryReceiptModel = `const { Schema, model } = require('mongoose');

const LorryReceiptSchema = new Schema({
  lrNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  reportingDate: { type: String },
  deliveryDate: { type: String },
  consignor: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  consignee: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  packages: [{
    count: { type: Number, required: true },
    packingMethod: { type: String, required: true },
    description: { type: String, required: true },
    actualWeight: { type: Number, required: true },
    chargedWeight: { type: Number, required: true },
  }],
  charges: {
    freight: { type: Number, default: 0 },
    aoc: { type: Number, default: 0 },
    hamali: { type: Number, default: 0 },
    bCh: { type: Number, default: 0 },
    trCh: { type: Number, default: 0 },
    detentionCh: { type: Number, default: 0 },
  },
  totalAmount: { type: Number, required: true },
  eWayBillNo: { type: String },
  valueGoods: { type: Number },
  gstPayableBy: { type: String, enum: ['CONSIGNOR', 'CONSIGNEE'], required: true },
  status: { type: String, enum: ['CREATED', 'INVOICED', 'DELIVERED'], default: 'CREATED' },
  insurance: {
    hasInsured: { type: Boolean, default: false },
    company: { type: String },
    policyNo: { type: String },
    date: { type: String },
    amount: { type: Number },
    risk: { type: String },
  },
  invoiceNo: { type: String },
  sealNo: { type: String },
});

module.exports = model('LorryReceipt', LorryReceiptSchema);`;

fs.writeFileSync('./dist/models/lorryReceipt.js', lorryReceiptModel);

const paymentModel = `const { Schema, model } = require('mongoose');

const PaymentSchema = new Schema({
  paymentNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI'], required: true },
  reference: { type: String },
  remarks: { type: String },
});

module.exports = model('Payment', PaymentSchema);`;

fs.writeFileSync('./dist/models/payment.js', paymentModel);

const truckHiringNoteModel = `const { Schema, model } = require('mongoose');

const TruckHiringNoteSchema = new Schema({
  thnNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  rate: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
  remarks: { type: String },
});

module.exports = model('TruckHiringNote', TruckHiringNoteSchema);`;

fs.writeFileSync('./dist/models/truckHiringNote.js', truckHiringNoteModel);

// Create controllers
fs.mkdirSync('./dist/controllers', { recursive: true });

const customerController = `const Customer = require('../models/customer');

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};`;

fs.writeFileSync('./dist/controllers/customerController.js', customerController);

const vehicleController = `const Vehicle = require('../models/vehicle');

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ number: 1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
};`;

fs.writeFileSync('./dist/controllers/vehicleController.js', vehicleController);

const invoiceController = `const Invoice = require('../models/invoice');
const LorryReceipt = require('../models/lorryReceipt');

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('customer').sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { lorryReceiptIds, ...invoiceData } = req.body;
    
    // Generate invoice number
    const count = await Invoice.countDocuments();
    const invoiceNumber = \`INV-\${String(count + 1).padStart(4, '0')}\`;
    
    const invoice = new Invoice({
      ...invoiceData,
      invoiceNumber,
      status: 'UNPAID',
    });
    
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  createInvoice
};`;

fs.writeFileSync('./dist/controllers/invoiceController.js', invoiceController);

const lorryReceiptController = `const LorryReceipt = require('../models/lorryReceipt');

const getLorryReceipts = async (req, res) => {
  try {
    const lorryReceipts = await LorryReceipt.find()
      .populate('consignor')
      .populate('consignee')
      .populate('vehicle')
      .sort({ date: -1 });
    res.json(lorryReceipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLorryReceipt = async (req, res) => {
  try {
    const lorryReceipt = new LorryReceipt(req.body);
    await lorryReceipt.save();
    res.status(201).json(lorryReceipt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getLorryReceipts,
  createLorryReceipt
};`;

fs.writeFileSync('./dist/controllers/lorryReceiptController.js', lorryReceiptController);

const paymentController = `const Payment = require('../models/payment');

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('customer').sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  createPayment
};`;

fs.writeFileSync('./dist/controllers/paymentController.js', paymentController);

const truckHiringNoteController = `const TruckHiringNote = require('../models/truckHiringNote');

const getTruckHiringNotes = async (req, res) => {
  try {
    const truckHiringNotes = await TruckHiringNote.find()
      .populate('customer')
      .populate('vehicle')
      .sort({ date: -1 });
    res.json(truckHiringNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTruckHiringNote = async (req, res) => {
  try {
    const truckHiringNote = new TruckHiringNote(req.body);
    await truckHiringNote.save();
    res.status(201).json(truckHiringNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTruckHiringNotes,
  createTruckHiringNote
};`;

fs.writeFileSync('./dist/controllers/truckHiringNoteController.js', truckHiringNoteController);

// Create routes
fs.mkdirSync('./dist/routes', { recursive: true });

const customerRoutes = `const express = require('express');
const customerController = require('../controllers/customerController');

const router = express.Router();

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;`;

fs.writeFileSync('./dist/routes/customerRoutes.js', customerRoutes);

const vehicleRoutes = `const express = require('express');
const vehicleController = require('../controllers/vehicleController');

const router = express.Router();

router.get('/', vehicleController.getVehicles);
router.post('/', vehicleController.createVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;`;

fs.writeFileSync('./dist/routes/vehicleRoutes.js', vehicleRoutes);

const invoiceRoutes = `const express = require('express');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', invoiceController.getInvoices);
router.post('/', invoiceController.createInvoice);

module.exports = router;`;

fs.writeFileSync('./dist/routes/invoiceRoutes.js', invoiceRoutes);

const lorryReceiptRoutes = `const express = require('express');
const lorryReceiptController = require('../controllers/lorryReceiptController');

const router = express.Router();

router.get('/', lorryReceiptController.getLorryReceipts);
router.post('/', lorryReceiptController.createLorryReceipt);

module.exports = router;`;

fs.writeFileSync('./dist/routes/lorryReceiptRoutes.js', lorryReceiptRoutes);

const paymentRoutes = `const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);

module.exports = router;`;

fs.writeFileSync('./dist/routes/paymentRoutes.js', paymentRoutes);

const truckHiringNoteRoutes = `const express = require('express');
const truckHiringNoteController = require('../controllers/truckHiringNoteController');

const router = express.Router();

router.get('/', truckHiringNoteController.getTruckHiringNotes);
router.post('/', truckHiringNoteController.createTruckHiringNote);

module.exports = router;`;

fs.writeFileSync('./dist/routes/truckHiringNoteRoutes.js', truckHiringNoteRoutes);

// Create auth routes
const authRoutes = `const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH || '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const inputHash = await hashPassword(password);

    if (inputHash === APP_PASSWORD_HASH) {
      const token = generateToken('admin');
      res.json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/verify', (req, res) => {
  res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;`;

fs.writeFileSync('./dist/routes/authRoutes.js', authRoutes);

// Create data routes
const dataRoutes = `const express = require('express');
const Customer = require('../models/customer');
const Vehicle = require('../models/vehicle');
const Invoice = require('../models/invoice');
const LorryReceipt = require('../models/lorryReceipt');
const Payment = require('../models/payment');
const TruckHiringNote = require('../models/truckHiringNote');

const router = express.Router();

router.get('/backup', async (req, res) => {
  try {
    const data = {
      customers: await Customer.find(),
      vehicles: await Vehicle.find(),
      invoices: await Invoice.find(),
      lorryReceipts: await LorryReceipt.find(),
      payments: await Payment.find(),
      truckHiringNotes: await TruckHiringNote.find(),
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Invoice.deleteMany({});
    await LorryReceipt.deleteMany({});
    await Payment.deleteMany({});
    await TruckHiringNote.deleteMany({});
    res.json({ message: 'All data reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;`;

fs.writeFileSync('./dist/routes/dataRoutes.js', dataRoutes);

// Create complete index.js
const indexJs = `const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const customerRoutes = require('./routes/customerRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const lorryReceiptRoutes = require('./routes/lorryReceiptRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dataRoutes = require('./routes/dataRoutes');
const truckHiringNoteRoutes = require('./routes/truckHiringNoteRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'https://allindialo.netlify.app'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Static serving for uploaded POD images
const path = require('path');
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req, res) => {
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
  console.log(\`Server running on port \${PORT}\`);
});`;

fs.writeFileSync('./dist/index.js', indexJs);

console.log('Complete build completed successfully!');
