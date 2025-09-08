import React, { useState, useMemo } from 'react';
import type { TruckHiringNote } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TruckHiringNoteForm } from './TruckHiringNoteForm';
import { formatDate } from '../services/utils';

interface TruckHiringNotesProps {
    notes: TruckHiringNote[];
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>) => Promise<any>;
}

export const TruckHiringNotes: React.FC<TruckHiringNotesProps> = ({ notes, onSave }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<TruckHiringNote | undefined>(undefined);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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

                return matchesSearch && matchesStartDate && matchesEndDate;
            })
            .sort((a, b) => b.thnNumber - a.thnNumber);
    }, [notes, searchTerm, startDate, endDate]);

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

    return (
        <div className="space-y-6">
            {isFormOpen && (
                <TruckHiringNoteForm
                    existingNote={editingNote}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Truck Hiring Notes</h2>
                <Button onClick={handleAddNew}>Add New THN</Button>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button className="text-indigo-600 hover:text-indigo-900">View PDF</button>
                                        <button onClick={() => handleEdit(note)} className="text-green-600 hover:text-green-900">Edit</button>
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
