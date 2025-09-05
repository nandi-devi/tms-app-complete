
import type { Customer } from '../types';

export function numberToWords(num: number): string {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const inWords = (n: number): string => {
        if (n < 20) return a[n];
        let digit = n % 10;
        let ten = Math.floor(n / 10);
        return `${b[ten]} ${a[digit]}`.trim();
    }

    const toWords = (n: number): string => {
        let str = '';
        if (n > 9999999) {
            str += toWords(Math.floor(n / 10000000)) + ' Crore ';
            n %= 10000000;
        }
        if (n > 99999) {
            str += toWords(Math.floor(n / 100000)) + ' Lakh ';
            n %= 100000;
        }
        if (n > 999) {
            str += toWords(Math.floor(n / 1000)) + ' Thousand ';
            n %= 1000;
        }
        if (n > 99) {
            str += toWords(Math.floor(n / 100)) + ' Hundred ';
            n %= 100;
        }
        if (n > 0) {
            str += inWords(n);
        }
        return str.trim();
    }

    if (num === 0) return 'Zero';
    const result = toWords(num);
    return result.split(' ').filter(Boolean).join(' ');
}

export const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Mock function to simulate fetching customer details from a GSTIN API
export const fetchGstDetails = (gstin: string): Promise<Omit<Customer, 'id'>> => {
    console.log(`Fetching details for GSTIN: ${gstin}`);
    
    // This is a mock API call. Replace with a real API endpoint.
    // The 'name' should be the Legal Name of Business.
    const mockDatabase: { [key: string]: Omit<Customer, 'id'> } = {
        '29AABCU9603R1ZM': { 
            name: 'Acme Technologies Private Limited', 
            tradeName: 'Acme Tech',
            address: '123 Tech Park, Electronic City,\nBangalore - 560100', 
            state: 'Karnataka',
            gstin 
        },
        '24AAACC1234A1Z5': { 
            name: 'Gujarat Goods Corporation', 
            tradeName: 'Gujarat Goods Corp',
            address: '456 Commerce House, Ring Road,\nSurat - 395002', 
            state: 'Gujarat',
            gstin 
        },
        '07AABCS1234D1Z2': { 
            name: 'Delhi Traders Incorporated', 
            tradeName: 'Delhi Traders Inc.',
            address: '789 Market Lane, Chandni Chowk,\nNew Delhi - 110006', 
            state: 'Delhi',
            gstin 
        },
         '33ITWPS2062F1Z7': {
            name: 'Navakar Enterprises Private Limited',
            tradeName: 'Navakar Enterprises',
            address: 'No-2/465,Brindavan Thotam Kasinaickanpatty,\nTirupattur - 635901',
            state: 'Tamil Nadu',
            gstin
        }
    };

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = mockDatabase[gstin.toUpperCase()];
            if (result) {
                resolve(result);
            } else {
                reject(new Error('GSTIN not found or invalid. Please check the number or enter details manually.'));
            }
        }, 1500); // Simulate network delay
    });
};