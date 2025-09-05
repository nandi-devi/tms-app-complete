import { Request, Response } from 'express';
import Customer from '../models/customer';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const customer = new Customer({
    name: req.body.name,
    tradeName: req.body.tradeName,
    address: req.body.address,
    state: req.body.state,
    gstin: req.body.gstin,
    contactPerson: req.body.contactPerson,
    contactPhone: req.body.contactPhone,
    contactEmail: req.body.contactEmail,
  });

  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
