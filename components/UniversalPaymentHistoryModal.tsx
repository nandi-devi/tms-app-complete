import React from 'react';
import type { Payment, Invoice, TruckHiringNote } from '../types';
import { InvoiceStatus, THNStatus } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate } from '../services/utils';

interface UniversalPaymentHistoryModalProps {
    invoice?: Invoice;
    truckHiringNote?: TruckHiringNote;
    payments: Payment[];
    onClose: () => void;
}

export const UniversalPaymentHistoryModal: React.FC<UniversalPaymentHistoryModalProps> = ({ 
    invoice, 
    truckHiringNote, 
    payments, 
    onClose 
}) => {
    const document = invoice || truckHiringNote;
    const documentType = invoice ? 'Invoice' : 'Truck Hiring Note';
    const documentNumber = invoice ? `#${invoice.invoiceNumber}` : `#${truckHiringNote?.thnNumber}`;
    
    // Filter payments for this document
    const relevantPayments = payments.filter(p => {
        if (invoice) {
            return (p.invoiceId as Invoice)?._id === invoice._id || p.invoiceId === invoice._id;
        }
        if (truckHiringNote) {
            return (p.truckHiringNoteId as TruckHiringNote)?._id === truckHiringNote._id || p.truckHiringNoteId === truckHiringNote._id;
        }
        return false;
    });

    // Sort payments by date (latest first)
    const sortedPayments = relevantPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate totals
    const totalPaid = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const grandTotal = document?.grandTotal || (truckHiringNote ? truckHiringNote.freightRate + (truckHiringNote.additionalCharges || 0) : 0);
    const balanceDue = grandTotal - totalPaid;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <Card title={`Payment History for ${documentType} ${documentNumber}`}>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
                            <p className="text-2xl font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-green-600">Total Paid</h3>
                            <p className="text-2xl font-bold text-green-700">₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-red-600">Balance Due</h3>
                            <p className="text-2xl font-bold text-red-700">₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="mb-6">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            balanceDue <= 0 
                                ? 'bg-green-100 text-green-800' 
                                : totalPaid > 0 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                        }`}>
                            {balanceDue <= 0 ? 'Fully Paid' : totalPaid > 0 ? 'Partially Paid' : 'Unpaid'}
                        </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="space-y-4">
                        {sortedPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment Date
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mode
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reference
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Notes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedPayments.map((payment, index) => (
                                            <tr key={payment._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(payment.date)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                    ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        payment.type === 'Advance' ? 'bg-blue-100 text-blue-800' :
                                                        payment.type === 'Receipt' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {payment.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        payment.mode === 'Cash' ? 'bg-gray-100 text-gray-800' :
                                                        payment.mode === 'UPI' ? 'bg-purple-100 text-purple-800' :
                                                        payment.mode === 'NEFT' || payment.mode === 'RTGS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {payment.mode}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {payment.referenceNo || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                                                    <div className="truncate" title={payment.notes || ''}>
                                                        {payment.notes || '-'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">No payments recorded</p>
                                <p className="text-gray-400 text-sm">Payments will appear here once they are added</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-6 mt-6 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
