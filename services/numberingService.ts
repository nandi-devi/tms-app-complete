import { API_BASE_URL } from '../constants';

export interface NumberingConfig {
  id: string;
  type: 'lr' | 'invoice';
  prefix: string;
  startNumber: number;
  endNumber: number;
  currentNumber: number;
  allowManualEntry: boolean;
  allowOutsideRange: boolean;
}

export interface NumberingConfigDto {
  type: 'lr' | 'invoice';
  prefix: string;
  startNumber: number;
  endNumber: number;
  allowManualEntry: boolean;
  allowOutsideRange: boolean;
}

class NumberingService {
  private configs: Map<string, NumberingConfig> = new Map();

  async loadConfigs(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/numbering/configs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const configs = await response.json();
        this.configs.clear();
        configs.forEach((config: NumberingConfig) => {
          this.configs.set(config.type, config);
        });
      }
    } catch (error) {
      console.error('Failed to load numbering configs:', error);
    }
  }

  async saveConfig(config: NumberingConfigDto): Promise<NumberingConfig> {
    const response = await fetch(`${API_BASE_URL}/numbering/configs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to save numbering config');
    }

    const savedConfig = await response.json();
    this.configs.set(config.type, savedConfig);
    return savedConfig;
  }

  async getNextNumber(type: 'lr' | 'invoice'): Promise<string> {
    const config = this.configs.get(type);
    if (!config) {
      throw new Error(`No numbering configuration found for ${type}`);
    }

    if (config.currentNumber > config.endNumber) {
      if (!config.allowOutsideRange) {
        throw new Error(`Number range exhausted for ${type}. Please update the range in settings.`);
      }
    }

    const nextNumber = config.currentNumber;
    const formattedNumber = `${config.prefix}${nextNumber.toString().padStart(6, '0')}`;

    // Update the current number
    await this.updateCurrentNumber(type, nextNumber + 1);

    return formattedNumber;
  }

  private async updateCurrentNumber(type: 'lr' | 'invoice', newNumber: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/numbering/update-current`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ type, currentNumber: newNumber }),
    });

    if (!response.ok) {
      throw new Error('Failed to update current number');
    }

    const config = this.configs.get(type);
    if (config) {
      config.currentNumber = newNumber;
    }
  }

  async validateManualNumber(type: 'lr' | 'invoice', number: string): Promise<{ valid: boolean; message?: string }> {
    const config = this.configs.get(type);
    if (!config) {
      return { valid: false, message: 'No numbering configuration found' };
    }

    if (!config.allowManualEntry) {
      return { valid: false, message: 'Manual entry is not allowed for this type' };
    }

    // Extract number from formatted string (remove prefix)
    const numberPart = number.replace(config.prefix, '');
    const numericValue = parseInt(numberPart, 10);

    if (isNaN(numericValue)) {
      return { valid: false, message: 'Invalid number format' };
    }

    if (numericValue < config.startNumber || numericValue > config.endNumber) {
      if (!config.allowOutsideRange) {
        return { valid: false, message: `Number must be between ${config.startNumber} and ${config.endNumber}` };
      }
    }

    return { valid: true };
  }

  getConfig(type: 'lr' | 'invoice'): NumberingConfig | undefined {
    return this.configs.get(type);
  }

  getAllConfigs(): NumberingConfig[] {
    return Array.from(this.configs.values());
  }
}

export const numberingService = new NumberingService();
