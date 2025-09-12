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

export interface NumberingConfigDto {
    key: 'invoiceId' | 'lorryReceiptId';
    start: number;
    end: number;
    allowOutsideRange?: boolean;
}

export const getNumberingConfigs = async (): Promise<Array<{ _id: string; start: number; end: number; next: number; allowOutsideRange?: boolean }>> => {
    const response = await fetch(`${API_BASE_URL}/data/numbering`);
    if (!response.ok) throw new Error('Failed to load numbering config');
    return response.json();
};

export const saveNumberingConfig = async (config: NumberingConfigDto) => {
    const response = await fetch(`${API_BASE_URL}/data/numbering`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: config.key, start: config.start, end: config.end, allowOutsideRange: !!config.allowOutsideRange }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to save numbering config');
    }
    return response.json();
};
