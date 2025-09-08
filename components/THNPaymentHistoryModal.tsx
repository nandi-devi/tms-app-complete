import React from 'react';
import type { Payment, TruckHiringNote } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate } from '../services/utils';

interface THNPaymentHistoryModalProps {
    truckHiringNote: TruckHiringNote;
    onClose: () => void;
}

export const THNPaymentHistoryModal: React.FC<THNPaymentHistoryModalProps> = ({ truckHiringNote, onClose }) => {
    const relevantPayments = truckHiringNote.payments || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <Card title={`Payment History for THN #${truckHiringNote.thnNumber}`}>
                    <div className="space-y-4">
                        {relevantPayments.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {relevantPayments.map(p => (
                                        <tr key={p._id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(p.date)}</td>
                                            <td className="px-4 py-2 text-right text-sm">₹{p.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-2 text-sm">{p.mode}</td>
                                            <td className="px-4 py-2 text-sm">{p.referenceNo || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-500 py-4">No payments have been recorded for this THN.</p>
                        )}
                    </div>
                    <div className="flex justify-end pt-6 mt-4 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
