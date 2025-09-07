import { API_BASE_URL } from '../constants';
import type { SupplierPayment } from '../types';

export const getSupplierPayments = async (): Promise<SupplierPayment[]> => {
    const response = await fetch(`${API_BASE_URL}/supplierpayments`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch supplier payments' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const createSupplierPayment = async (payment: Omit<SupplierPayment, '_id' | 'supplier'> & { supplier: string }): Promise<SupplierPayment> => {
    const response = await fetch(`${API_BASE_URL}/supplierpayments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create supplier payment' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const updateSupplierPayment = async (id: string, payment: Partial<Omit<SupplierPayment, '_id' | 'supplier'>> & { supplier?: string }): Promise<SupplierPayment> => {
    const response = await fetch(`${API_BASE_URL}/supplierpayments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update supplier payment' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const deleteSupplierPayment = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/supplierpayments/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete supplier payment' }));
        throw new Error(errorData.message);
    }
};
