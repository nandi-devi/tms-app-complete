import React, { useState } from 'react';
import type { Payment } from '../types';
import { PaymentMode, PaymentType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { getCurrentDate } from '../services/utils';

interface PaymentFormProps {
    invoiceId: string;
    customerId: string;
    grandTotal: number;
    balanceDue: number;
    onSave: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
    onClose: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ invoiceId, customerId, grandTotal, balanceDue, onSave, onClose }) => {
    const totalPaid = grandTotal - balanceDue;

    const [payment, setPayment] = useState({
        invoiceId,
        customerId,
        amount: balanceDue,
        date: getCurrentDate(),
        type: PaymentType.RECEIPT,
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
            console.error("Failed to save payment", error);
            alert('Failed to save payment. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={`Add Payment for INV-${invoiceId.slice(-6)}`}>
                        <div className="p-4 bg-slate-50 border rounded-lg mb-4 grid grid-cols-3 gap-x-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Invoice Total</p>
                                <p className="font-semibold text-lg">₹{(grandTotal || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="font-semibold text-lg text-green-600">₹{(totalPaid || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Balance Due</p>
                                <p className="font-semibold text-lg text-red-600">₹{balanceDue.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Input
                                label="Amount to Pay (₹)"
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
                                label="Reference No. (Cheque, NEFT, etc.)"
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
