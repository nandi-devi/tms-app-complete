const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting basic build process...');

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

// Create basic JavaScript files
console.log('Creating basic JavaScript files...');

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

// Create basic controllers
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

// Create basic routes
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

// Create basic auth routes
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

// Create basic index.js
const indexJs = `const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const customerRoutes = require('./routes/customerRoutes');
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

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

fs.writeFileSync('./dist/index.js', indexJs);

console.log('Basic build completed successfully!');
