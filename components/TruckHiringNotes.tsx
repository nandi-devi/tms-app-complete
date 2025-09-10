import React, { useState, useMemo } from 'react';
import type { TruckHiringNote, Payment } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TruckHiringNoteForm } from './TruckHiringNoteForm';
import { THNPaymentForm } from './THNPaymentForm';
import { THNPaymentHistoryModal } from './THNPaymentHistoryModal';
import { formatDate } from '../services/utils';
import type { View } from '../App';

interface TruckHiringNotesProps {
    notes: TruckHiringNote[];
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>) => Promise<any>;
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
}

export const TruckHiringNotes: React.FC<TruckHiringNotesProps> = ({ notes, onSave, onSavePayment, onViewChange, onBack, initialFilters }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<TruckHiringNote | undefined>(undefined);
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [selectedNoteForPayment, setSelectedNoteForPayment] = useState<TruckHiringNote | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<TruckHiringNote | null>(null);

    const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
    const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters?.endDate || '');
    const [showOnlyOutstanding, setShowOnlyOutstanding] = useState(initialFilters?.showOnlyOutstanding || false);

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = searchTerm === '' ||
                    note.thnNumber.toString().includes(searchTerm) ||
                    note.truckOwnerName.toLowerCase().includes(searchLower) ||
                    note.truckNumber.toLowerCase().includes(searchLower) ||
                    note.origin.toLowerCase().includes(searchLower) ||
                    note.destination.toLowerCase().includes(searchLower);

                const noteDate = new Date(note.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                const matchesStartDate = !start || noteDate >= start;
                const matchesEndDate = !end || noteDate <= end;
                const matchesOutstanding = !showOnlyOutstanding || note.balancePayable > 0;

                return matchesSearch && matchesStartDate && matchesEndDate && matchesOutstanding;
            })
            .sort((a, b) => b.thnNumber - a.thnNumber);
    }, [notes, searchTerm, startDate, endDate, showOnlyOutstanding]);

    const handleSave = async (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>) => {
        await onSave(note);
        setIsFormOpen(false);
        setEditingNote(undefined);
    };

    const handleAddNew = () => {
        setEditingNote(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (note: TruckHiringNote) => {
        setEditingNote(note);
        setIsFormOpen(true);
    };

    const handleOpenPaymentForm = (note: TruckHiringNote) => {
        setSelectedNoteForPayment(note);
        setIsPaymentFormOpen(true);
    };

    const handleOpenHistoryModal = (note: TruckHiringNote) => {
        setSelectedNoteForHistory(note);
        setIsHistoryModalOpen(true);
    };

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
                <THNPaymentForm
                    truckHiringNote={selectedNoteForPayment}
                    onSave={onSavePayment}
                    onClose={() => setIsPaymentFormOpen(false)}
                />
            )}
            {isHistoryModalOpen && selectedNoteForHistory && (
                <THNPaymentHistoryModal
                    truckHiringNote={selectedNoteForHistory}
                    onClose={() => setIsHistoryModalOpen(false)}
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
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THN No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck Owner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From / To</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Freight</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredNotes.map(note => (
                                <tr key={note._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{note.thnNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(note.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{note.truckOwnerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{note.truckNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{note.origin} to {note.destination}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{note.freight.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">₹{note.balancePayable.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {note.status !== 'Paid' && (
                                            <button onClick={() => handleOpenPaymentForm(note)} className="text-blue-600 hover:text-blue-900 transition-colors">Add Payment</button>
                                        )}
                                        <button onClick={() => handleOpenHistoryModal(note)} className="text-gray-600 hover:text-gray-900 transition-colors">History</button>
                                        <button onClick={() => onViewChange({ name: 'VIEW_THN', id: note._id })} className="text-indigo-600 hover:text-indigo-900 transition-colors">View PDF</button>
                                        <button onClick={() => handleEdit(note)} className="text-green-600 hover:text-green-900 transition-colors">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredNotes.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">No Truck Hiring Notes found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
