import React, { useState, useEffect, useMemo } from 'react';
import type { PromissoryNote, Supplier } from '../types';
import { getPromissoryNotes, createPromissoryNote, updatePromissoryNote, deletePromissoryNote } from '../services/promissoryNoteService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PromissoryNoteForm } from './PromissoryNoteForm';
import { formatDate } from '../services/utils';

interface PromissoryNotesProps {
  supplier: Supplier;
  onBack: () => void;
}

export const PromissoryNotes: React.FC<PromissoryNotesProps> = ({ supplier, onBack }) => {
    const [notes, setNotes] = useState<PromissoryNote[]>([]);
    const [editingNote, setEditingNote] = useState<Partial<Omit<PromissoryNote, 'supplier'>> & { supplier: Supplier } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supplierNotes = useMemo(() => {
        return notes.filter(n => n.supplier._id === supplier._id);
    }, [notes, supplier]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPromissoryNotes();
            setNotes(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch promissory notes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [supplier]);

    const handleSave = async (noteData: Partial<Omit<PromissoryNote, '_id' | 'supplier'>> & { _id?: string, supplier: string }) => {
        try {
            if (noteData._id) {
                await updatePromissoryNote(noteData._id, noteData);
            } else {
                await createPromissoryNote(noteData as any);
            }
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save note');
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this promissory note?')) {
            try {
                await deletePromissoryNote(id);
                await fetchData();
            } catch (err: any) {
                setError(err.message || 'Failed to delete note');
            }
        }
    };

    const handleAddNew = () => {
        setEditingNote({ supplier });
    };

    const handleEdit = (note: PromissoryNote) => {
        setEditingNote(note);
    };

    if (isLoading) return <Card><p>Loading notes...</p></Card>;
    if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;

    return (
        <div className="space-y-6">
            {editingNote && <PromissoryNoteForm note={editingNote} onSave={handleSave} onClose={() => setEditingNote(null)} />}
            <div className="flex justify-between items-center">
                 <div>
                    <Button variant="secondary" onClick={onBack}>&larr; Back to Supplier Dues</Button>
                    <h2 className="text-3xl font-bold text-gray-800 mt-2">Promissory Notes for {supplier.name}</h2>
                </div>
                <Button onClick={handleAddNew}>Add New Note</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {supplierNotes.map(note => (
                                <tr key={note._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(note.issueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatDate(note.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{note.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${note.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {note.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(note)} className="text-green-600 hover:text-green-900">Edit</button>
                                        <button onClick={() => handleDelete(note._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {supplierNotes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No promissory notes found for this supplier.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
