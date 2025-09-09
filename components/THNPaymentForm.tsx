import React, { useState } from 'react';
import type { Payment, TruckHiringNote } from '../types';
import { PaymentMode, PaymentType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { getCurrentDate } from '../services/utils';

interface THNPaymentFormProps {
    truckHiringNote: TruckHiringNote;
    onSave: (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => Promise<void>;
    onClose: () => void;
}

export const THNPaymentForm: React.FC<THNPaymentFormProps> = ({ truckHiringNote, onSave, onClose }) => {
    const [payment, setPayment] = useState({
        truckHiringNoteId: truckHiringNote._id,
        amount: truckHiringNote.balancePayable,
        date: getCurrentDate(),
        type: PaymentType.PAYMENT,
        mode: PaymentMode.CASH,
        referenceNo: '',
        notes: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setPayment(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (payment.amount <= 0) {
            alert('Payment amount must be greater than zero.');
            return;
        }
        setIsSaving(true);
        try {
            await onSave(payment);
            onClose();
        } catch (error) {
            console.error("Failed to save THN payment", error);
            alert('Failed to save THN payment. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={`Add Payment for THN #${truckHiringNote.thnNumber}`}>
                        <div className="p-4 bg-slate-50 rounded-lg text-sm mb-4">
                            <p><strong>Truck Owner:</strong> {truckHiringNote.truckOwnerName}</p>
                            <p><strong>Total Freight:</strong> ₹{truckHiringNote.freight.toLocaleString('en-IN')}</p>
                            <p className="font-bold"><strong>Balance Payable:</strong> ₹{truckHiringNote.balancePayable.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="space-y-4">
                            <Input
                                label="Amount (₹)"
                                name="amount"
                                type="number"
                                value={payment.amount}
                                onChange={handleChange}
                                required
                                onFocus={e => e.target.select()}
                            />
                            <Input
                                label="Payment Date"
                                name="date"
                                type="date"
                                value={payment.date}
                                onChange={handleChange}
                                required
                            />
                            <Select label="Payment Mode" name="mode" value={payment.mode} onChange={handleChange} required>
                                {Object.values(PaymentMode).map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </Select>
                            <Input
                                label="Reference No."
                                name="referenceNo"
                                value={payment.referenceNo || ''}
                                onChange={handleChange}
                            />
                            <Textarea
                                label="Notes"
                                name="notes"
                                value={payment.notes || ''}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-6 mt-4 border-t">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Payment'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};
