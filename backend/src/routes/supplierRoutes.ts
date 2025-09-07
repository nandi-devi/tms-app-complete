import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierDues,
  getSupplierDuesSummary,
} from '../controllers/supplierController';

const router = express.Router();

router.route('/dues-summary')
    .get(getSupplierDuesSummary);

router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

router.route('/:id/dues')
    .get(getSupplierDues);

export default router;
