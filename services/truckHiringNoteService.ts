import { API_BASE_URL } from '../constants';
import type { TruckHiringNote } from '../types';

export const getTruckHiringNotes = async (): Promise<TruckHiringNote[]> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes`);
    if (!response.ok) {
        throw new Error('Failed to fetch Truck Hiring Notes');
    }
    return response.json();
};

export const createTruckHiringNote = async (note: Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>): Promise<TruckHiringNote> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
    if (!response.ok) {
        throw new Error('Failed to create Truck Hiring Note');
    }
    return response.json();
};

export const updateTruckHiringNote = async (id: string, note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>): Promise<TruckHiringNote> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
    if (!response.ok) {
        throw new Error('Failed to update Truck Hiring Note');
    }
    return response.json();
};
