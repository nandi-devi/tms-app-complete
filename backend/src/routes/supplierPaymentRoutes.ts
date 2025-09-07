import express from 'express';
import {
  getSupplierPayments,
  getSupplierPaymentById,
  createSupplierPayment,
  updateSupplierPayment,
  deleteSupplierPayment,
} from '../controllers/supplierPaymentController';

const router = express.Router();

router.route('/')
  .get(getSupplierPayments)
  .post(createSupplierPayment);

router.route('/:id')
  .get(getSupplierPaymentById)
  .put(updateSupplierPayment)
  .delete(deleteSupplierPayment);

export default router;
