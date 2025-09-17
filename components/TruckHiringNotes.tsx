import React, { useState, useMemo } from 'react';
import type { TruckHiringNote, Payment } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TruckHiringNoteForm } from './TruckHiringNoteForm';
import { UniversalPaymentForm } from './UniversalPaymentForm';
import { UniversalPaymentHistoryModal } from './UniversalPaymentHistoryModal';
import { formatDate } from '../services/utils';
import type { View } from '../App';

interface TruckHiringNotesProps {
    notes: TruckHiringNote[];
    payments: Payment[];
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => Promise<any>;
    onUpdate: (id: string, note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => Promise<any>;
    onDelete: (id: string) => Promise<void>;
    onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => Promise<void>;
    onViewChange: (view: View) => void;
    onBack: () => void;
    initialFilters?: Partial<Record<keyof THNTableFilters, any>>;
}

interface THNTableFilters {
    searchTerm: string;
    startDate: string;
    endDate: string;
    showOnlyOutstanding: boolean;
    truckType: string;
    status: string;
}

export const TruckHiringNotes: React.FC<TruckHiringNotesProps> = ({ 
    notes, payments, onSave, onUpdate, onDelete, onSavePayment, onViewChange, onBack, initialFilters 
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<TruckHiringNote | undefined>(undefined);
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
    const [selectedNoteForPayment, setSelectedNoteForPayment] = useState<TruckHiringNote | null>(null);
    const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<TruckHiringNote | null>(null);

    const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
    const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters?.endDate || '');
    const [showOnlyOutstanding, setShowOnlyOutstanding] = useState(initialFilters?.showOnlyOutstanding || false);
    const [truckType, setTruckType] = useState(initialFilters?.truckType || '');
    const [status, setStatus] = useState(initialFilters?.status || '');

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = searchTerm === '' ||
                    note.thnNumber.toString().includes(searchTerm) ||
                    note.truckOwnerName.toLowerCase().includes(searchLower) ||
                    note.truckNumber.toLowerCase().includes(searchLower) ||
                    note.loadingLocation.toLowerCase().includes(searchLower) ||
                    note.unloadingLocation.toLowerCase().includes(searchLower) ||
                    note.goodsType.toLowerCase().includes(searchLower);

                const noteDate = new Date(note.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                const matchesStartDate = !start || noteDate >= start;
                const matchesEndDate = !end || noteDate <= end;
                const matchesOutstanding = !showOnlyOutstanding || note.balanceAmount > 0;
                const matchesTruckType = !truckType || note.truckType === truckType;
                const matchesStatus = !status || note.status === status;

                return matchesSearch && matchesStartDate && matchesEndDate && 
                       matchesOutstanding && matchesTruckType && matchesStatus;
            })
            .sort((a, b) => b.thnNumber - a.thnNumber);
    }, [notes, searchTerm, startDate, endDate, showOnlyOutstanding, truckType, status]);

    const handleSave = async (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => {
        if (editingNote) {
            await onUpdate(editingNote._id, note);
        } else {
            await onSave(note);
        }
        setIsFormOpen(false);
        setEditingNote(undefined);
    };

    const handleAddNew = () => {
        setEditingNote(undefined);
        setIsFormOpen(true);
    };

    const handleAddPayment = (note: TruckHiringNote) => {
        setSelectedNoteForPayment(note);
        setIsPaymentFormOpen(true);
    };

    const handleViewPaymentHistory = (note: TruckHiringNote) => {
        setSelectedNoteForHistory(note);
        setIsPaymentHistoryOpen(true);
    };

    const handleSavePayment = async (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => {
        await onSavePayment(payment);
        setIsPaymentFormOpen(false);
        setSelectedNoteForPayment(null);
    };

    const handleEdit = (note: TruckHiringNote) => {
        setEditingNote(note);
        setIsFormOpen(true);
    };

    const handleDelete = async (note: TruckHiringNote) => {
        if (window.confirm(`Are you sure you want to delete THN #${note.thnNumber}?`)) {
            try {
                await onDelete(note._id);
            } catch (error) {
                console.error('Failed to delete THN:', error);
                alert('Failed to delete THN. Please try again.');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-100';
            case 'UNPAID': return 'text-red-600 bg-red-100';
            case 'PARTIAL': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const uniqueTruckTypes = Array.from(new Set(notes.map(note => note.truckType))).sort();

    return (
        <div className="space-y-6">
            {isFormOpen && (
                <TruckHiringNoteForm
                    existingNote={editingNote}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
            
            {isPaymentFormOpen && selectedNoteForPayment && (
                <UniversalPaymentForm
                    truckHiringNoteId={selectedNoteForPayment._id}
                    customerId={selectedNoteForPayment.agencyName} // Using agency name as customer
                    grandTotal={selectedNoteForPayment.totalAmount || (selectedNoteForPayment.freightRate + (selectedNoteForPayment.additionalCharges || 0))}
                    balanceDue={selectedNoteForPayment.balanceAmount}
                    onSave={handleSavePayment}
                    onClose={() => {
                        setIsPaymentFormOpen(false);
                        setSelectedNoteForPayment(null);
                    }}
                    title={`Add Payment for THN #${selectedNoteForPayment.thnNumber}`}
                />
            )}

            {isPaymentHistoryOpen && selectedNoteForHistory && (
                <UniversalPaymentHistoryModal
                    truckHiringNote={selectedNoteForHistory}
                    payments={payments}
                    onClose={() => {
                        setIsPaymentHistoryOpen(false);
                        setSelectedNoteForHistory(null);
                    }}
                />
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Truck Hiring Notes</h2>
                <div>
                    <Button onClick={handleAddNew} className="mr-4">Add New THN</Button>
                    <Button variant="secondary" onClick={onBack}>Back</Button>
                </div>
            </div>

            <Card title="Filters">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        type="text"
                        label="Search by THN No, Owner, Truck No, etc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        wrapperClassName="md:col-span-3"
                    />
                    <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <div className="flex items-center pt-6">
                        <input
                            id="outstanding-checkbox"
                            type="checkbox"
                            checked={showOnlyOutstanding}
                            onChange={(e) => setShowOnlyOutstanding(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="outstanding-checkbox" className="ml-2 block text-sm text-gray-900">
                            Show Only Outstanding
                        </label>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Truck Type</label>
                        <select
                            value={truckType}
                            onChange={(e) => setTruckType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        >
                            <option value="">All Types</option>
                            {uniqueTruckTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        >
                            <option value="">All Status</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="PAID">Paid</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THN No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Freight</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredNotes.map(note => (
                                <tr key={note._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{note.thnNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(note.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div className="font-medium">{note.truckNumber}</div>
                                            <div className="text-xs text-gray-400">{note.truckType}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div>{note.loadingLocation} → {note.unloadingLocation}</div>
                                            <div className="text-xs text-gray-400">{note.goodsType}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div className="font-medium">{note.truckOwnerName}</div>
                                            {note.truckOwnerContact && (
                                                <div className="text-xs text-gray-400">{note.truckOwnerContact}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        ₹{(note.freightRate || 0).toLocaleString('en-IN')}
                                        {note.additionalCharges > 0 && (
                                            <div className="text-xs text-gray-400">+₹{note.additionalCharges.toLocaleString('en-IN')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                                        ₹{(note.paidAmount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">
                                        ₹{(note.balanceAmount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(note.status)}`}>
                                            {note.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => handleAddPayment(note)} 
                                            className="text-green-600 hover:text-green-900 transition-colors"
                                            title="Add Payment"
                                        >
                                            Payment
                                        </button>
                                        <button 
                                            onClick={() => handleViewPaymentHistory(note)} 
                                            className="text-purple-600 hover:text-purple-900 transition-colors"
                                            title="View Payment History"
                                        >
                                            History
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(note)} 
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(note)} 
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredNotes.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="text-center py-8 text-gray-500">
                                        No Truck Hiring Notes found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
