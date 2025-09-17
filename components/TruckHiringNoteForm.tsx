import React, { useState, useEffect } from 'react';
import type { TruckHiringNote } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { getCurrentDate } from '../services/utils';

interface TruckHiringNoteFormProps {
    existingNote?: TruckHiringNote;
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>) => Promise<any>;
    onCancel: () => void;
}

export const TruckHiringNoteForm: React.FC<TruckHiringNoteFormProps> = ({ existingNote, onSave, onCancel }) => {
    const getInitialState = (): Partial<Omit<TruckHiringNote, '_id' | 'thnNumber'>> => ({
        date: getCurrentDate(),
        transporterCompanyName: '',
        truckNumber: '',
        origin: '',
        destination: '',
        goodsType: '',
        weight: 0,
        freight: 0,
        advancePaid: 0,
        expectedDeliveryDate: '',
        specialInstructions: '',
        paymentTerms: 'COD',
        reminders: '',
        gstRate: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        loadingCharges: 0,
        unloadingCharges: 0,
        detentionCharges: 0,
        totalGstAmount: 0,
        grandTotal: 0,
    });

    const [note, setNote] = useState(existingNote || getInitialState());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (existingNote) {
            setNote(existingNote);
        }
    }, [existingNote]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setNote(prev => {
            const updatedNote = {
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value,
            };
            
            // Calculate GST and totals when relevant fields change
            if (['freight', 'loadingCharges', 'unloadingCharges', 'detentionCharges', 'gstRate'].includes(name)) {
                const freight = updatedNote.freight || 0;
                const loadingCharges = updatedNote.loadingCharges || 0;
                const unloadingCharges = updatedNote.unloadingCharges || 0;
                const detentionCharges = updatedNote.detentionCharges || 0;
                const gstRate = updatedNote.gstRate || 0;
                
                const subtotal = freight + loadingCharges + unloadingCharges + detentionCharges;
                const totalGstAmount = (subtotal * gstRate) / 100;
                const grandTotal = subtotal + totalGstAmount;
                
                // Calculate CGST/SGST or IGST based on origin/destination
                const isInterState = updatedNote.origin !== updatedNote.destination;
                const cgstAmount = isInterState ? 0 : totalGstAmount / 2;
                const sgstAmount = isInterState ? 0 : totalGstAmount / 2;
                const igstAmount = isInterState ? totalGstAmount : 0;
                
                return {
                    ...updatedNote,
                    cgstAmount,
                    sgstAmount,
                    igstAmount,
                    totalGstAmount,
                    grandTotal,
                    balancePayable: grandTotal - (updatedNote.advancePaid || 0)
                };
            }
            
            // Recalculate balance when advance changes
            if (name === 'advancePaid') {
                const grandTotal = updatedNote.grandTotal || 0;
                return {
                    ...updatedNote,
                    balancePayable: grandTotal - (parseFloat(value) || 0)
                };
            }
            
            return updatedNote;
        });
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

    const balancePayable = (note.grandTotal || 0) - (note.advancePaid || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={existingNote ? `Edit Truck Hiring Note #${existingNote.thnNumber}` : 'Create New Truck Hiring Note'}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input label="Date" name="date" type="date" value={note.date || ''} onChange={handleChange} required />
                            <Input label="Transporter/Company Name" name="transporterCompanyName" value={note.transporterCompanyName || ''} onChange={handleChange} required />
                            <Input label="Truck Number" name="truckNumber" value={note.truckNumber || ''} onChange={handleChange} required />
                            <Input label="Expected Delivery Date" name="expectedDeliveryDate" type="date" value={note.expectedDeliveryDate || ''} onChange={handleChange} required />
                        </div>

                        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Origin" name="origin" value={note.origin || ''} onChange={handleChange} required />
                            <Input label="Destination" name="destination" value={note.destination || ''} onChange={handleChange} required />
                            <Input label="Type of Goods" name="goodsType" value={note.goodsType || ''} onChange={handleChange} required />
                            <Input label="Weight (kg)" name="weight" type="number" value={note.weight || 0} onChange={handleChange} required />
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
                            
                            {/* Payment Terms */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Select 
                                    label="Payment Terms" 
                                    name="paymentTerms" 
                                    value={note.paymentTerms || 'COD'} 
                                    onChange={handleChange}
                                    options={[
                                        { value: 'COD', label: 'Cash on Delivery' },
                                        { value: 'Credit', label: 'Credit' },
                                        { value: 'Advance', label: 'Advance Payment' }
                                    ]}
                                    required 
                                />
                                <Input label="Reminders" name="reminders" value={note.reminders || ''} onChange={handleChange} placeholder="Payment reminders and notes" />
                            </div>

                            {/* Basic Charges */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Input label="Freight (₹)" name="freight" type="number" value={note.freight || 0} onChange={handleChange} required />
                                <Input label="Loading Charges (₹)" name="loadingCharges" type="number" value={note.loadingCharges || 0} onChange={handleChange} />
                                <Input label="Unloading Charges (₹)" name="unloadingCharges" type="number" value={note.unloadingCharges || 0} onChange={handleChange} />
                                <Input label="Detention Charges (₹)" name="detentionCharges" type="number" value={note.detentionCharges || 0} onChange={handleChange} />
                            </div>

                            {/* GST Calculation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Input label="GST Rate (%)" name="gstRate" type="number" value={note.gstRate || 18} onChange={handleChange} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subtotal (₹)</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                        {((note.freight || 0) + (note.loadingCharges || 0) + (note.unloadingCharges || 0) + (note.detentionCharges || 0)).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>

                            {/* GST Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">CGST (₹)</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                        {(note.cgstAmount || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">SGST (₹)</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                        {(note.sgstAmount || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">IGST (₹)</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                        {(note.igstAmount || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>

                            {/* Total and Payment */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total GST (₹)</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                                        {(note.totalGstAmount || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Grand Total (₹)</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 font-semibold">
                                        {(note.grandTotal || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <Input label="Advance Paid (₹)" name="advancePaid" type="number" value={note.advancePaid || 0} onChange={handleChange} />
                            </div>

                            {/* Balance Payable */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700">Balance Payable (₹)</label>
                                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 font-semibold text-lg">
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
