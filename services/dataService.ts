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

export const backupData = async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/data/backup`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to backup data');
    }
    return response.json();
};

export const restoreData = async (data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/data/restore`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore data');
    }
    return response.json();
};
