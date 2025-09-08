import { Customer, Vehicle, TruckHiringNote, THNStatus } from './types';

// Note: _id fields are intentionally omitted. MongoDB will generate them.
// The purpose of this mock data is to have some initial customers and vehicles
// to select from when creating new Lorry Receipts.

export const mockCustomers: Omit<Customer, '_id'>[] = [
  { name: 'Navakar Enterprises Private Limited', tradeName: 'Navakar Enterprises', address: 'No-2/465,Brindavan Thotam Kasinaickanpatty,\nTirupattur - 635901', state: 'Tamil Nadu', gstin: '33ITWPS2062F1Z7', contactPerson: 'Mr. Jain', contactPhone: '9876543210', contactEmail: 'jain@navakar.com' },
  { name: 'Shubhkarat India Limited', tradeName: 'Shubhkarat India', address: 'Bhiwandi', state: 'Maharashtra', gstin: '27AAAAA0000A1Z5', contactPerson: 'Mr. Patel', contactPhone: '9123456789' },
  { name: 'Reliance Industries Limited', tradeName: 'Reliance Industries', address: 'Maker Chambers IV, Nariman Point, Mumbai', state: 'Maharashtra', gstin: '27AABCR1234D1Z2', contactEmail: 'procurement@reliance.com' },
];

export const mockVehicles: Omit<Vehicle, '_id'>[] = [
  { number: 'TN 20 AX 1234' },
  { number: 'TN 19 BY 5678' },
  { number: 'MH 04 CZ 9012' },
];

export const mockTruckHiringNotes: Omit<TruckHiringNote, '_id' | 'thnNumber' | 'payments'>[] = [
    {
        date: '2023-10-01',
        truckOwnerName: 'Ravi Transport',
        truckNumber: 'MH 12 AB 3456',
        driverName: 'Suresh Kumar',
        driverLicense: 'DL123456789',
        origin: 'Mumbai',
        destination: 'Pune',
        goodsType: 'Electronics',
        weight: 5000,
        freight: 15000,
        advancePaid: 5000,
        balancePayable: 10000,
        expectedDeliveryDate: '2023-10-02',
        specialInstructions: 'Handle with care.',
        status: THNStatus.UNPAID,
        paidAmount: 5000,
    },
    {
        date: '2023-10-03',
        truckOwnerName: 'Gupta Logistics',
        truckNumber: 'GJ 05 XY 7890',
        driverName: 'Ramesh Patel',
        driverLicense: 'DL987654321',
        origin: 'Ahmedabad',
        destination: 'Surat',
        goodsType: 'Textiles',
        weight: 8000,
        freight: 22000,
        advancePaid: 10000,
        balancePayable: 12000,
        expectedDeliveryDate: '2023-10-04',
        status: THNStatus.PARTIALLY_PAID,
        paidAmount: 10000,
    }
];
