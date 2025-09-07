import { API_BASE_URL } from '../constants';
import type { Supplier } from '../types';

export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await fetch(`${API_BASE_URL}/suppliers`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch suppliers' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const createSupplier = async (supplier: Omit<Supplier, '_id'>): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create supplier' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update supplier' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const deleteSupplier = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete supplier' }));
        throw new Error(errorData.message);
    }
};
