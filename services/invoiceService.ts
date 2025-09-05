import type { Invoice } from '../types';
import { API_BASE_URL } from '../constants';

export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await fetch(`${API_BASE_URL}/invoices`);
    if (!response.ok) {
        throw new Error('Failed to fetch invoices');
    }
    return response.json();
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | '_id'>): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
    });
    if (!response.ok) {
        throw new Error('Failed to create invoice');
    }
    return response.json();
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
    });
    if (!response.ok) {
        throw new Error('Failed to update invoice');
    }
    return response.json();
};

export const deleteInvoice = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete invoice');
    }
};
