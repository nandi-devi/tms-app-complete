import type { LorryReceipt } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const getLorryReceipts = async (): Promise<LorryReceipt[]> => {
    const response = await fetch(`${API_BASE_URL}/lorryreceipts`);
    if (!response.ok) {
        throw new Error('Failed to fetch lorry receipts');
    }
    return response.json();
};

export const createLorryReceipt = async (lorryReceipt: Omit<LorryReceipt, 'id' | '_id'>): Promise<LorryReceipt> => {
    const response = await fetch(`${API_BASE_URL}/lorryreceipts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lorryReceipt),
    });
    if (!response.ok) {
        throw new Error('Failed to create lorry receipt');
    }
    return response.json();
};

export const updateLorryReceipt = async (id: string, lorryReceipt: Partial<LorryReceipt>): Promise<LorryReceipt> => {
    const response = await fetch(`${API_BASE_URL}/lorryreceipts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lorryReceipt),
    });
    if (!response.ok) {
        throw new Error('Failed to update lorry receipt');
    }
    return response.json();
};

export const deleteLorryReceipt = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/lorryreceipts/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete lorry receipt');
    }
};
