import { API_BASE_URL } from '../constants';
import type { TruckRental } from '../types';

export const getTruckRentals = async (): Promise<TruckRental[]> => {
    const response = await fetch(`${API_BASE_URL}/truckrentals`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch truck rentals' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const createTruckRental = async (rental: Omit<TruckRental, '_id' | 'supplier' | 'truck'> & { supplier: string, truck: string }): Promise<TruckRental> => {
    const response = await fetch(`${API_BASE_URL}/truckrentals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rental),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create truck rental' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const updateTruckRental = async (id: string, rental: Partial<Omit<TruckRental, '_id' | 'supplier' | 'truck'>> & { supplier?: string, truck?: string }): Promise<TruckRental> => {
    const response = await fetch(`${API_BASE_URL}/truckrentals/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rental),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update truck rental' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const deleteTruckRental = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/truckrentals/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete truck rental' }));
        throw new Error(errorData.message);
    }
};
