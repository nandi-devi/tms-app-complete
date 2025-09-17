import { API_BASE_URL } from '../constants';
import type { LorryReceipt } from '../types';


export const getLorryReceipts = async (): Promise<LorryReceipt[]> => {
    const response = await fetch(`${API_BASE_URL}/lorryreceipts`);
    if (!response.ok) {
        throw new Error('Failed to fetch lorry receipts');
    }
    const data = await response.json();
    // Handle both paginated and direct array responses
    return Array.isArray(data) ? data : (data.items || []);
};

export const createLorryReceipt = async (lorryReceipt: Omit<LorryReceipt, 'id' | '_id'>): Promise<LorryReceipt> => {
    // Transform frontend data format to backend format
    const backendData = {
        ...lorryReceipt,
        consignor: lorryReceipt.consignorId,
        consignee: lorryReceipt.consigneeId,
        vehicle: lorryReceipt.vehicleId,
    };
    
    // Remove the frontend-specific fields
    delete (backendData as any).consignorId;
    delete (backendData as any).consigneeId;
    delete (backendData as any).vehicleId;
    
    const response = await fetch(`${API_BASE_URL}/lorryreceipts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('Server validation error:', errorData);
        const details = (errorData?.errors?.fieldErrors) ?
          Object.entries(errorData.errors.fieldErrors)
            .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
            .join(' | ') : undefined;
        const composed = [errorData?.message, details].filter(Boolean).join(' - ');
        const err = new Error(`Failed to create lorry receipt: ${composed || 'Unknown server error'}`);
        (err as any).fieldErrors = errorData?.errors?.fieldErrors;
        throw err;
    }
    return response.json();
};

export const updateLorryReceipt = async (id: string, lorryReceipt: Partial<LorryReceipt>): Promise<LorryReceipt> => {
    // Transform frontend data format to backend format
    const backendData = { ...lorryReceipt };
    
    if (lorryReceipt.consignorId) {
        backendData.consignor = lorryReceipt.consignorId;
        delete (backendData as any).consignorId;
    }
    if (lorryReceipt.consigneeId) {
        backendData.consignee = lorryReceipt.consigneeId;
        delete (backendData as any).consigneeId;
    }
    if (lorryReceipt.vehicleId) {
        backendData.vehicle = lorryReceipt.vehicleId;
        delete (backendData as any).vehicleId;
    }
    
    const response = await fetch(`${API_BASE_URL}/lorryreceipts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
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

export const uploadPod = async (id: string, data: { receiverName: string; receiverPhone?: string; remarks?: string; photos?: File[]; latitude?: number; longitude?: number; recordedBy?: string; }): Promise<LorryReceipt> => {
    const form = new FormData();
    form.append('receiverName', data.receiverName || '');
    if (data.receiverPhone) form.append('receiverPhone', data.receiverPhone);
    if (data.remarks) form.append('remarks', data.remarks);
    if (typeof data.latitude === 'number') form.append('latitude', String(data.latitude));
    if (typeof data.longitude === 'number') form.append('longitude', String(data.longitude));
    if (data.recordedBy) form.append('recordedBy', data.recordedBy);
    (data.photos || []).forEach(f => form.append('photos', f));

    const response = await fetch(`${API_BASE_URL}/lorryreceipts/${id}/delivery`, {
        method: 'POST',
        body: form,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to upload POD: ${text}`);
    }
    return response.json();
};
