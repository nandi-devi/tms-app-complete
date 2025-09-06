import { API_BASE_URL } from '../constants';

export const resetApplicationData = async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/data/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset data');
    }
    return response.json();
};

export const loadMockData = async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/data/load-mock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load mock data');
    }
    return response.json();
};
