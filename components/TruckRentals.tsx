import React, { useState, useEffect, useMemo } from 'react';
import type { TruckRental, Supplier, Vehicle } from '../types';
import { getTruckRentals, createTruckRental, updateTruckRental, deleteTruckRental } from '../services/truckRentalService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TruckRentalForm } from './TruckRentalForm';
import { formatDate } from '../services/utils';

interface TruckRentalsProps {
  supplier: Supplier;
  vehicles: Vehicle[];
  onBack: () => void;
}

export const TruckRentals: React.FC<TruckRentalsProps> = ({ supplier, vehicles, onBack }) => {
    const [rentals, setRentals] = useState<TruckRental[]>([]);
    const [editingRental, setEditingRental] = useState<Partial<Omit<TruckRental, 'supplier' | 'truck'>> & { supplier?: Supplier, truck?: Vehicle } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supplierRentals = useMemo(() => {
        return rentals.filter(r => r.supplier._id === supplier._id);
    }, [rentals, supplier]);

    const fetchRentals = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTruckRentals();
            setRentals(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch truck rentals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRentals();
    }, []);

    const handleSave = async (rentalData: Partial<Omit<TruckRental, '_id' | 'supplier' | 'truck'>> & { _id?: string, supplier: string, truck: string }) => {
        try {
            if (rentalData._id) {
                await updateTruckRental(rentalData._id, rentalData);
            } else {
                await createTruckRental(rentalData as any); // Type assertion for simplicity
            }
            await fetchRentals();
        } catch (err: any) {
            setError(err.message || 'Failed to save rental');
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this rental agreement?')) {
            try {
                await deleteTruckRental(id);
                await fetchRentals();
            } catch (err: any) {
                setError(err.message || 'Failed to delete rental');
            }
        }
    };

    const handleAddNew = () => {
        setEditingRental({ supplier });
    };

    const handleEdit = (rental: TruckRental) => {
        setEditingRental(rental);
    };

    const handleCloseModal = () => {
        setEditingRental(null);
    };

    if (isLoading) {
        return <Card><p>Loading rentals...</p></Card>;
    }

    if (error) {
        return <Card><p className="text-red-500">Error: {error}</p></Card>;
    }

    return (
        <div className="space-y-6">
            {editingRental && <TruckRentalForm rental={editingRental} vehicles={vehicles} onSave={handleSave} onClose={handleCloseModal} />}
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="secondary" onClick={onBack}>&larr; Back to Suppliers</Button>
                    <h2 className="text-3xl font-bold text-gray-800 mt-2">Rentals for {supplier.name}</h2>
                </div>
                <Button onClick={handleAddNew}>Add New Rental</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Truck No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {supplierRentals.map(rental => (
                                <tr key={rental._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rental.truck.number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{rental.rentalRate.toLocaleString()} / {rental.rentalType.replace('-', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(rental.startDate)} - {rental.endDate ? formatDate(rental.endDate) : 'Present'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(rental)} className="text-green-600 hover:text-green-900">Edit</button>
                                        <button onClick={() => handleDelete(rental._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {supplierRentals.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">No rental agreements found for this supplier.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
