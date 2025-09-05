
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
// Assuming you have your API key stored in an environment variable
// For client-side Vite apps, it should be VITE_GSTIN_API_KEY
const GSTIN_API_KEY = import.meta.env.VITE_GSTIN_API_KEY; 

export const fetchGstDetails = async (gstin: string): Promise<Omit<Customer, 'id'>> => {
    console.log(`Fetching details for GSTIN: ${gstin}`);

    if (!GSTIN_API_KEY) {
        throw new Error('GSTIN API Key is not configured. Please set VITE_GSTIN_API_KEY in your environment variables.');
    }

    const apiUrl = `https://sheet.gstincheck.co.in/check/${GSTIN_API_KEY}/${gstin}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 401, 500)
            const errorText = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // The API response structure might be different from your Customer type.
        // You'll need to map the API response data to your Customer type.
        // Example:
        const customerDetails: Omit<Customer, 'id'> = {
            name: data.legalName || '', // Adjust based on actual API response field names
            tradeName: data.tradeName || '',
            address: data.address || '',
            state: data.state || '',
            gstin: data.gstin || gstin, // Use the GSTIN from response or input
            contactPerson: '', // API might not provide this
            contactPhone: '', // API might not provide this
            contactEmail: '', // API might not provide this
        };

        return customerDetails;

    } catch (error: any) {
        console.error("Error fetching GSTIN details:", error);
        throw new Error(`Failed to fetch GSTIN details: ${error.message}`);
    }
};