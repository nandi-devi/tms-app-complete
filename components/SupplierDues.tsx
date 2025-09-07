import React, { useState, useEffect, useMemo } from 'react';
import type { Supplier, TruckRental, SupplierPayment } from '../types';
import { getSupplierDues } from '../services/supplierService';
import { createSupplierPayment } from '../services/supplierPaymentService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SupplierPaymentForm } from './SupplierPaymentForm';
import { formatDate } from '../services/utils';

interface SupplierDuesProps {
  supplier: Supplier;
  onBack: () => void;
  onViewChange: (view: any) => void; // Using any for simplicity
}

interface DuesData {
    totalRentalCost: number;
    totalPaid: number;
    balance: number;
    transactions: {
        type: 'debit' | 'credit';
        date: string;
        id: string;
        particulars: string;
        amount: number;
    }[];
}

export const SupplierDues: React.FC<SupplierDuesProps> = ({ supplier, onBack, onViewChange }) => {
    const [duesData, setDuesData] = useState<DuesData | null>(null);
    const [editingPayment, setEditingPayment] = useState<Partial<Omit<SupplierPayment, 'supplier'>> & { supplier: Supplier } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getSupplierDues(supplier._id);
            setDuesData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dues data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [supplier]);

    const transactionsWithBalance = useMemo(() => {
        if (!duesData) return [];
        let runningBalance = 0;
        return duesData.transactions.map(tx => {
            const debit = tx.type === 'debit' ? tx.amount : 0;
            const credit = tx.type === 'credit' ? tx.amount : 0;
            runningBalance += debit - credit;
            return { ...tx, debit, credit, balance: runningBalance };
        });
    }, [duesData]);

    const handleSavePayment = async (paymentData: Partial<Omit<SupplierPayment, '_id' | 'supplier'>> & { _id?: string, supplier: string }) => {
        try {
            await createSupplierPayment(paymentData as any);
            await fetchData(); // Refetch data after saving
        } catch (err: any) {
            setError(err.message || 'Failed to save payment');
            throw err;
        }
    };

    if (isLoading) return <Card><p>Loading data...</p></Card>;
    if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;
    if (!duesData) return <Card><p>No dues data available.</p></Card>;

    return (
        <div className="space-y-6">
            {editingPayment && <SupplierPaymentForm payment={editingPayment} rentals={[]} onSave={handleSavePayment} onClose={() => setEditingPayment(null)} />}
            <div className="flex justify-between items-center">
                 <div>
                    <Button variant="secondary" onClick={onBack}>&larr; Back to Suppliers</Button>
                    <h2 className="text-3xl font-bold text-gray-800 mt-2">Dues for {supplier.name}</h2>
                </div>
                <div>
                    <Button variant="outline" className="mr-2" onClick={() => onViewChange({ name: 'PROMISSORY_NOTES', supplierId: supplier._id })}>Manage Notes</Button>
                    <Button onClick={() => setEditingPayment({ supplier })}>Add Payment</Button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <h4 className="text-sm font-medium text-gray-600">Total Dues (Debit)</h4>
                    <p className="text-2xl font-bold text-red-600">₹{duesData.totalRentalCost.toLocaleString()}</p>
                </div>
                 <div>
                    <h4 className="text-sm font-medium text-gray-600">Total Paid (Credit)</h4>
                    <p className="text-2xl font-bold text-green-600">₹{duesData.totalPaid.toLocaleString()}</p>
                </div>
                 <div>
                    <h4 className="text-sm font-medium text-gray-600">Net Balance</h4>
                    <p className={`text-2xl font-bold ${duesData.balance >= 0 ? 'text-indigo-900' : 'text-green-800'}`}>
                        ₹{Math.abs(duesData.balance).toLocaleString()} {duesData.balance >= 0 ? 'Dr' : 'Cr'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactionsWithBalance.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(tx.date)}</td>
                                    <td className="px-6 py-4 text-sm">{tx.particulars}</td>
                                    <td className="px-6 py-4 text-right text-sm text-red-700">{tx.debit > 0 ? tx.debit.toLocaleString() : '-'}</td>
                                    <td className="px-6 py-4 text-right text-sm text-green-700">{tx.credit > 0 ? tx.credit.toLocaleString() : '-'}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-sm">
                                        {Math.abs(tx.balance).toLocaleString()} {tx.balance >= 0 ? 'Dr' : 'Cr'}
                                    </td>
                                </tr>
                            ))}
                            {transactionsWithBalance.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No transactions found for this supplier.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
