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

export const restoreBackupData = async (backupData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/data/restore`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore data');
    }
    return response.json();
};

export const getBackupData = async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/data/backup`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch backup data');
    }
    return response.json();
};
