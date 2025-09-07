import { API_BASE_URL } from '../constants';
import type { PromissoryNote } from '../types';

export const getPromissoryNotes = async (): Promise<PromissoryNote[]> => {
    const response = await fetch(`${API_BASE_URL}/promissorynotes`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch promissory notes' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const createPromissoryNote = async (note: Omit<PromissoryNote, '_id' | 'supplier'> & { supplier: string }): Promise<PromissoryNote> => {
    const response = await fetch(`${API_BASE_URL}/promissorynotes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create promissory note' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const updatePromissoryNote = async (id: string, note: Partial<Omit<PromissoryNote, '_id' | 'supplier'>> & { supplier?: string }): Promise<PromissoryNote> => {
    const response = await fetch(`${API_BASE_URL}/promissorynotes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update promissory note' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const deletePromissoryNote = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/promissorynotes/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete promissory note' }));
        throw new Error(errorData.message);
    }
};
