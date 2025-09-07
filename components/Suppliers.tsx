import React, { useState, useEffect } from 'react';
import type { Supplier } from '../types';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/supplierService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SupplierForm } from './SupplierForm';

export const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch suppliers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSave = async (supplierData: Partial<Supplier>) => {
        try {
            if (supplierData._id) {
                await updateSupplier(supplierData._id, supplierData);
            } else {
                await createSupplier(supplierData as Omit<Supplier, '_id'>);
            }
            await fetchSuppliers(); // Refetch to get the updated list
        } catch (err: any) {
            setError(err.message || 'Failed to save supplier');
            // Re-throw to be caught by the form if needed
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await deleteSupplier(id);
                await fetchSuppliers(); // Refetch to get the updated list
            } catch (err: any) {
                setError(err.message || 'Failed to delete supplier');
            }
        }
    };

    const handleAddNew = () => {
        setEditingSupplier({ name: '', contactPerson: '', email: '', phone: '', paymentTerms: '', notes: '' });
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
    };

    const handleCloseModal = () => {
        setEditingSupplier(null);
    };

    if (isLoading) {
        return <Card><p>Loading suppliers...</p></Card>;
    }

    if (error) {
        return <Card><p className="text-red-500">Error: {error}</p></Card>;
    }

    return (
        <div className="space-y-6">
            {editingSupplier && <SupplierForm supplier={editingSupplier} onSave={handleSave} onClose={handleCloseModal} />}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Manage Suppliers</h2>
                <Button onClick={handleAddNew}>Add New Supplier</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Terms</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {suppliers.map(supplier => (
                                <tr key={supplier._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">{supplier.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                                        {supplier.contactPerson && <div className="font-semibold">{supplier.contactPerson}</div>}
                                        {supplier.phone && <div className="text-xs">{supplier.phone}</div>}
                                        {supplier.email && <div className="text-xs">{supplier.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">{supplier.paymentTerms}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4 align-top">
                                        <button onClick={() => handleEdit(supplier)} className="text-green-600 hover:text-green-900 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(supplier._id)} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">No suppliers found. Click 'Add New Supplier' to get started.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
