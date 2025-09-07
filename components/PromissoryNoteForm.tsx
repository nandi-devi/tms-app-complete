import React, { useState, useEffect } from 'react';
import type { PromissoryNote, Supplier } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { getCurrentDate } from '../services/utils';

interface PromissoryNoteFormProps {
    note: Partial<Omit<PromissoryNote, 'supplier'>> & { supplier: Supplier };
    onSave: (note: Partial<Omit<PromissoryNote, '_id' | 'supplier'>> & { _id?: string, supplier: string }) => Promise<any>;
    onClose: () => void;
}

export const PromissoryNoteForm: React.FC<PromissoryNoteFormProps> = ({ note, onSave, onClose }) => {
    const [formData, setFormData] = useState<any>({ ...note, issueDate: getCurrentDate() });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({ ...note, issueDate: note.issueDate || getCurrentDate() });
    }, [note]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'A valid amount is required.';
        if (!formData.issueDate) newErrors.issueDate = 'Issue date is required.';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsSaving(true);
            try {
                const submissionData = {
                    ...formData,
                    supplier: formData.supplier._id,
                };
                await onSave(submissionData);
                onClose();
            } catch (error) {
                console.error("Failed to save promissory note", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const generateTextSummary = () => {
        const text = `
--- PROMISSORY NOTE ---
Supplier: ${formData.supplier.name}
Amount: ₹${formData.amount?.toLocaleString() || 'N/A'}
Issue Date: ${formData.issueDate || 'N/A'}
Due Date: ${formData.dueDate || 'N/A'}
Payment Terms: ${formData.paymentTerms || 'As per agreement'}
Status: ${formData.isPaid ? 'Paid' : 'Unpaid'}
-----------------------
        `;
        alert(text.trim());
    };

    return (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
          onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                <Card title={formData._id ? 'Edit Promissory Note' : `New Note for ${formData.supplier?.name}`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Amount (₹)" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} error={errors.amount} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Issue Date" name="issueDate" type="date" value={formData.issueDate?.split('T')[0] || ''} onChange={handleChange} error={errors.issueDate} required />
                            <Input label="Due Date" name="dueDate" type="date" value={formData.dueDate?.split('T')[0] || ''} onChange={handleChange} error={errors.dueDate} required />
                        </div>
                        <Textarea label="Payment Terms" name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleChange} rows={3} />

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="isPaid" id="isPaid" checked={formData.isPaid || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="isPaid" className="text-sm text-gray-700">Mark as Paid</label>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t mt-4">
                            <div>
                                <Button type="button" variant="outline" onClick={generateTextSummary}>Generate Text</Button>
                                {/* PDF generation would require a library like jsPDF */}
                            </div>
                            <div className="flex space-x-2">
                                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Note'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
