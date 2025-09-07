import React, { useState, useEffect } from 'react';
import type { Supplier } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface SupplierFormProps {
    supplier: Partial<Supplier> | null;
    onSave: (supplier: Partial<Supplier>) => Promise<any>;
    onClose: () => void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSave, onClose }) => {
    if (!supplier) return null;

    const [formData, setFormData] = useState(supplier);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(supplier);
    }, [supplier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name || !formData.name.trim()) newErrors.name = 'Supplier name is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsSaving(true);
            try {
                await onSave(formData);
                onClose();
            } catch (error) {
                console.error("Failed to save supplier", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                <Card title={formData._id ? 'Edit Supplier' : 'Add New Supplier'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Supplier Name" name="name" value={formData.name || ''} onChange={handleChange} error={errors.name} required />
                        <Input label="Contact Person" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} />
                        <Input label="Contact Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                        <Input label="Contact Email" type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                        <Input label="Payment Terms" name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleChange} />
                        <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} />

                        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Supplier'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
