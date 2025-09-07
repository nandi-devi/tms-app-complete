import express from 'express';
import {
  getTruckRentals,
  getTruckRentalById,
  createTruckRental,
  updateTruckRental,
  deleteTruckRental,
} from '../controllers/truckRentalController';

const router = express.Router();

router.route('/')
  .get(getTruckRentals)
  .post(createTruckRental);

router.route('/:id')
  .get(getTruckRentalById)
  .put(updateTruckRental)
  .delete(deleteTruckRental);

export default router;
