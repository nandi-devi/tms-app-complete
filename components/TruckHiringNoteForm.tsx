import React, { useState, useEffect } from 'react';
import type { TruckHiringNote } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { getCurrentDate } from '../services/utils';

interface TruckHiringNoteFormProps {
    existingNote?: TruckHiringNote;
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>) => Promise<any>;
    onCancel: () => void;
}

export const TruckHiringNoteForm: React.FC<TruckHiringNoteFormProps> = ({ existingNote, onSave, onCancel }) => {
    const getInitialState = (): Partial<Omit<TruckHiringNote, '_id' | 'thnNumber'>> => ({
        date: getCurrentDate(),
        truckOwnerName: '',
        truckNumber: '',
        driverName: '',
        driverLicense: '',
        origin: '',
        destination: '',
        goodsType: '',
        weight: 0,
        freight: 0,
        advancePaid: 0,
        expectedDeliveryDate: '',
        specialInstructions: '',
    });

    const [note, setNote] = useState(existingNote || getInitialState());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (existingNote) {
            setNote(existingNote);
        }
    }, [existingNote]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setNote(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(note);
        } catch (error) {
            console.error("Failed to save Truck Hiring Note", error);
        } finally {
            setIsSaving(false);
        }
    };

    const balancePayable = (note.freight || 0) - (note.advancePaid || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={existingNote ? `Edit Truck Hiring Note #${existingNote.thnNumber}` : 'Create New Truck Hiring Note'}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input label="Date" name="date" type="date" value={note.date || ''} onChange={handleChange} required />
                            <Input label="Truck Owner Name" name="truckOwnerName" value={note.truckOwnerName || ''} onChange={handleChange} required />
                            <Input label="Truck Number" name="truckNumber" value={note.truckNumber || ''} onChange={handleChange} required />
                            <Input label="Driver Name" name="driverName" value={note.driverName || ''} onChange={handleChange} required />
                            <Input label="Driver License" name="driverLicense" value={note.driverLicense || ''} onChange={handleChange} required />
                            <Input label="Expected Delivery Date" name="expectedDeliveryDate" type="date" value={note.expectedDeliveryDate || ''} onChange={handleChange} required />
                        </div>

                        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Origin" name="origin" value={note.origin || ''} onChange={handleChange} required />
                            <Input label="Destination" name="destination" value={note.destination || ''} onChange={handleChange} required />
                            <Input label="Type of Goods" name="goodsType" value={note.goodsType || ''} onChange={handleChange} required />
                            <Input label="Weight (kg)" name="weight" type="number" value={note.weight || 0} onChange={handleChange} required />
                        </div>

                        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input label="Freight (₹)" name="freight" type="number" value={note.freight || 0} onChange={handleChange} required />
                            <Input label="Advance Paid (₹)" name="advancePaid" type="number" value={note.advancePaid || 0} onChange={handleChange} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Balance Payable (₹)</label>
                                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                    {balancePayable.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <Textarea label="Special Instructions" name="specialInstructions" value={note.specialInstructions || ''} onChange={handleChange} rows={4} />
                        </div>

                        <div className="flex justify-end space-x-2 pt-6 mt-6 border-t">
                            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Note'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};
