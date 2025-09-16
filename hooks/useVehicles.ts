import { useState, useCallback } from 'react';
import { Vehicle } from '../types';
import {
  getVehicles as getVehiclesService,
  createVehicle as createVehicleService,
} from '../services/vehicleService';

export const useVehicles = (initialVehicles: Vehicle[] = []) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const fetchVehicles = useCallback(async () => {
    try {
      const fetchedVehicles = await getVehiclesService();
      setVehicles(fetchedVehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      // Handle error appropriately
    }
  }, []);

  const createVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      const newVehicle = await createVehicleService(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      throw error;
    }
  }, []);

  return {
    vehicles,
    fetchVehicles,
    createVehicle,
    setVehicles,
  };
};
