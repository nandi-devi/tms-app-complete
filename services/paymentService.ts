import { API_BASE_URL } from '../constants';
import type { Payment } from '../types';


export const getPayments = async (): Promise<Payment[]> => {
    const response = await fetch(`${API_BASE_URL}/payments`);
    if (!response.ok) {
        throw new Error('Failed to fetch payments');
    }
    const data = await response.json();
    // Handle both paginated and direct array responses
    return Array.isArray(data) ? data : (data.items || []);
};

export const createPayment = async (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>): Promise<Payment> => {
    // Transform frontend data format to backend format
    const backendData = {
        ...payment,
        customer: payment.customerId,
    };
    
    // Remove the frontend-specific fields
    delete (backendData as any).customerId;
    
    const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
    });
    if (!response.ok) {
        throw new Error('Failed to create payment');
    }
    return response.json();
};

export const updatePayment = async (id: string, payment: Partial<Payment>): Promise<Payment> => {
    // Transform frontend data format to backend format
    const backendData = { ...payment };
    
    if (payment.customerId) {
        backendData.customer = payment.customerId;
        delete (backendData as any).customerId;
    }
    
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
    });
    if (!response.ok) {
        throw new Error('Failed to update payment');
    }
    return response.json();
};

export const deletePayment = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete payment');
    }
};
