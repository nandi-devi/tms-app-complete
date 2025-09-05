import { API_BASE_URL } from '../constants';
import type { Vehicle } from '../types';


export const getVehicles = async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
    }
    return response.json();
};

export const createVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
        throw new Error('Failed to create vehicle');
    }
    return response.json();
};

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
        throw new Error('Failed to update vehicle');
    }
    return response.json();
};

export const deleteVehicle = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete vehicle');
    }
};
