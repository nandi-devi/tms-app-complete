import React, { useState, useEffect } from 'react';
import type { SupplierPayment, Supplier, TruckRental } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { getCurrentDate } from '../services/utils';

interface SupplierPaymentFormProps {
    payment: Partial<Omit<SupplierPayment, 'supplier'>> & { supplier: Supplier };
    rentals: TruckRental[];
    onSave: (payment: Partial<Omit<SupplierPayment, '_id' | 'supplier'>> & { _id?: string, supplier: string }) => Promise<any>;
    onClose: () => void;
}

export const SupplierPaymentForm: React.FC<SupplierPaymentFormProps> = ({ payment, rentals, onSave, onClose }) => {
    const [formData, setFormData] = useState<any>({ ...payment, paymentDate: getCurrentDate() });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({ ...payment, paymentDate: getCurrentDate() });
    }, [payment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'A valid payment amount is required.';
        if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required.';
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
                console.error("Failed to save supplier payment", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
          onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                <Card title={formData._id ? 'Edit Payment' : `New Payment for ${formData.supplier?.name}`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Payment Amount (₹)" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} error={errors.amount} required />
                        <Input label="Payment Date" name="paymentDate" type="date" value={formData.paymentDate?.split('T')[0] || ''} onChange={handleChange} error={errors.paymentDate} required />

                        <Select label="Related Rental (Optional)" name="relatedRental" value={formData.relatedRental || ''} onChange={handleChange}>
                            <option value="">None</option>
                            {rentals.map(r => <option key={r._id} value={r._id}>
                                Truck {r.truck.number} / {formatDate(r.startDate)}
                            </option>)}
                        </Select>

                        <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} />

                        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Payment'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
