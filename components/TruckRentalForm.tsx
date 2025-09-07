import React, { useState, useEffect } from 'react';
import type { TruckRental, Supplier, Vehicle } from '../types';
import { RentalType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface TruckRentalFormProps {
    rental: Partial<Omit<TruckRental, 'supplier' | 'truck'>> & { supplier?: Supplier, truck?: Vehicle };
    vehicles: Vehicle[];
    onSave: (rental: Partial<Omit<TruckRental, '_id' | 'supplier' | 'truck'>> & { _id?: string, supplier: string, truck: string }) => Promise<any>;
    onClose: () => void;
}

export const TruckRentalForm: React.FC<TruckRentalFormProps> = ({ rental, vehicles, onSave, onClose }) => {
    const [formData, setFormData] = useState<any>(rental);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            ...rental,
            truck: rental.truck?._id, // Set only the ID for the select input
        });
    }, [rental]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.truck) newErrors.truck = 'Truck is required.';
        if (!formData.rentalRate || formData.rentalRate <= 0) newErrors.rentalRate = 'A valid rental rate is required.';
        if (!formData.rentalType) newErrors.rentalType = 'Rental type is required.';
        if (!formData.startDate) newErrors.startDate = 'Start date is required.';
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
                    supplier: formData.supplier._id, // Ensure supplier ID is passed
                };
                await onSave(submissionData);
                onClose();
            } catch (error) {
                console.error("Failed to save truck rental", error);
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
                <Card title={formData._id ? 'Edit Truck Rental' : `New Rental for ${formData.supplier?.name}`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select label="Truck" name="truck" value={formData.truck || ''} onChange={handleChange} error={errors.truck} required>
                            <option value="" disabled>Select a truck</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.number}</option>)}
                        </Select>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Rental Rate (₹)" name="rentalRate" type="number" value={formData.rentalRate || ''} onChange={handleChange} error={errors.rentalRate} required />
                            <Select label="Rental Type" name="rentalType" value={formData.rentalType || ''} onChange={handleChange} error={errors.rentalType} required>
                                <option value="" disabled>Select type</option>
                                {Object.values(RentalType).map(rt => <option key={rt} value={rt}>{rt}</option>)}
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Start Date" name="startDate" type="date" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} error={errors.startDate} required />
                            <Input label="End Date (Optional)" name="endDate" type="date" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Rental Agreement'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
