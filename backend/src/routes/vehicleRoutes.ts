import express from 'express';
import {
    getVehicles,
    createVehicle,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} from '../controllers/vehicleController';

const router = express.Router();

router.route('/')
    .get(getVehicles)
    .post(createVehicle);

router.route('/:id')
    .get(getVehicleById)
    .put(updateVehicle)
    .delete(deleteVehicle);

export default router;
