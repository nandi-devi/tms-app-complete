import React, { useState, useEffect, useRef } from 'react';
import type { TruckHiringNote } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { getCurrentDate } from '../services/utils';

interface TruckHiringNoteFormProps {
    existingNote?: TruckHiringNote;
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => Promise<any>;
    onCancel: () => void;
}

export const TruckHiringNoteForm: React.FC<TruckHiringNoteFormProps> = ({ existingNote, onSave, onCancel }) => {
    const getInitialState = (): Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>> => ({
        date: getCurrentDate(),
        truckNumber: '',
        truckType: '',
        vehicleCapacity: 0,
        loadingLocation: '',
        unloadingLocation: '',
        loadingDateTime: '',
        expectedDeliveryDate: '',
        goodsType: '',
        agencyName: '',
        truckOwnerName: '',
        truckOwnerContact: '',
        freightRate: 0,
        freightRateType: 'per_trip',
        advanceAmount: 0,
        paymentMode: 'Cash',
        paymentTerms: '',
        additionalCharges: 0,
        remarks: '',
        linkedLR: '',
        linkedInvoice: ''
    });

    const [note, setNote] = useState(existingNote || getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);
    const formRef = useRef<HTMLFormElement>(null);

    // Common truck types
    const truckTypes = [
        'Open Body', 'Container', 'Trailer', 'Tanker', 'Refrigerated', 
        'Flatbed', 'Box Truck', 'Dump Truck', 'Crane Truck', 'Other'
    ];

    // Common goods types
    const commonGoodsTypes = [
        'General Cargo', 'Textiles', 'Electronics', 'Machinery', 'Food Items', 
        'Pharmaceuticals', 'Automotive Parts', 'Construction Materials', 
        'Agricultural Products', 'Chemicals', 'Furniture', 'Books & Stationery', 
        'Garments', 'Footwear', 'Home Appliances'
    ];

    // Common cities for autocomplete
    const commonCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
        'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
        'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
        'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar'
    ];

    useEffect(() => {
        if (existingNote) {
            setNote(existingNote);
        }
    }, [existingNote]);

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!note.date) newErrors.date = 'Date is required';
        if (!note.truckNumber?.trim()) newErrors.truckNumber = 'Truck number is required';
        if (!note.truckType?.trim()) newErrors.truckType = 'Truck type is required';
        if (!note.vehicleCapacity || note.vehicleCapacity <= 0) newErrors.vehicleCapacity = 'Vehicle capacity must be greater than 0';
        if (!note.loadingLocation?.trim()) newErrors.loadingLocation = 'Loading location is required';
        if (!note.unloadingLocation?.trim()) newErrors.unloadingLocation = 'Unloading location is required';
        if (!note.loadingDateTime) newErrors.loadingDateTime = 'Loading date & time is required';
        if (!note.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Expected delivery date is required';
        if (!note.goodsType?.trim()) newErrors.goodsType = 'Type of goods is required';
        if (!note.agencyName?.trim()) newErrors.agencyName = 'Agency name is required';
        if (!note.truckOwnerName?.trim()) newErrors.truckOwnerName = 'Truck owner name is required';
        if (!note.freightRate || note.freightRate <= 0) newErrors.freightRate = 'Freight rate is required';
        if (!note.paymentMode?.trim()) newErrors.paymentMode = 'Payment mode is required';
        if (!note.paymentTerms?.trim()) newErrors.paymentTerms = 'Payment terms are required';
        
        // Validate dates
        if (note.loadingDateTime && note.expectedDeliveryDate) {
            const loadingDate = new Date(note.loadingDateTime);
            const deliveryDate = new Date(note.expectedDeliveryDate);
            if (deliveryDate < loadingDate) {
                newErrors.expectedDeliveryDate = 'Delivery date cannot be before loading date';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        setNote(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Focus on first error field
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                element?.focus();
            }
            return;
        }
        
        setIsSaving(true);
        try {
            await onSave(note);
        } catch (error) {
            console.error("Failed to save Truck Hiring Note", error);
        } finally {
            setIsSaving(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(note.date && note.truckNumber?.trim() && note.truckType?.trim() && note.vehicleCapacity && note.vehicleCapacity > 0);
            case 2:
                return !!(note.loadingLocation?.trim() && note.unloadingLocation?.trim() && note.loadingDateTime && note.expectedDeliveryDate && note.goodsType?.trim());
            case 3:
                return !!(note.agencyName?.trim() && note.truckOwnerName?.trim() && note.freightRate && note.freightRate > 0);
            case 4:
                return !!(note.paymentMode?.trim() && note.paymentTerms?.trim());
            default:
                return false;
        }
    };

    const balanceAmount = (note.freightRate || 0) + (note.additionalCharges || 0) - (note.advanceAmount || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8" onClick={e => e.stopPropagation()}>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <Card title={existingNote ? `Edit Truck Hiring Note #${existingNote.thnNumber}` : 'Create New Truck Hiring Note'}>
                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center space-x-4">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                            currentStep >= step 
                                                ? 'bg-blue-600 text-white' 
                                                : isStepValid(step) 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {isStepValid(step) && currentStep > step ? '✓' : step}
                                        </div>
                                        <span className={`ml-2 text-sm font-medium ${
                                            currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {step === 1 ? 'Basic Info' : step === 2 ? 'Trip Details' : step === 3 ? 'Party & Freight' : 'Payment'}
                                        </span>
                                        {step < 4 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Date" 
                                        name="date" 
                                        type="date" 
                                        value={note.date || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.date}
                                    />
                                    <Input 
                                        label="Truck Number" 
                                        name="truckNumber" 
                                        value={note.truckNumber || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.truckNumber}
                                        placeholder="e.g., MH-12-AB-1234"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select 
                                        label="Truck Type" 
                                        name="truckType" 
                                        value={note.truckType || ''} 
                                        onChange={handleChange}
                                        options={truckTypes.map(type => ({ value: type, label: type }))}
                                        required 
                                        error={errors.truckType}
                                    />
                                    <Input 
                                        label="Vehicle Capacity (tons)" 
                                        name="vehicleCapacity" 
                                        type="number" 
                                        value={note.vehicleCapacity || 0} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.vehicleCapacity}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Trip Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Trip Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Loading Location</label>
                                        <input
                                            type="text"
                                            name="loadingLocation"
                                            value={note.loadingLocation || ''}
                                            onChange={handleChange}
                                            list="loading-cities"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                                            placeholder="Enter loading location"
                                            required
                                        />
                                        <datalist id="loading-cities">
                                            {commonCities.map(city => <option key={city} value={city} />)}
                                        </datalist>
                                        {errors.loadingLocation && <p className="text-red-500 text-xs mt-1">{errors.loadingLocation}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unloading Location</label>
                                        <input
                                            type="text"
                                            name="unloadingLocation"
                                            value={note.unloadingLocation || ''}
                                            onChange={handleChange}
                                            list="unloading-cities"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                                            placeholder="Enter unloading location"
                                            required
                                        />
                                        <datalist id="unloading-cities">
                                            {commonCities.map(city => <option key={city} value={city} />)}
                                        </datalist>
                                        {errors.unloadingLocation && <p className="text-red-500 text-xs mt-1">{errors.unloadingLocation}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Loading Date & Time" 
                                        name="loadingDateTime" 
                                        type="datetime-local" 
                                        value={note.loadingDateTime || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.loadingDateTime}
                                    />
                                    <Input 
                                        label="Expected Delivery Date" 
                                        name="expectedDeliveryDate" 
                                        type="date" 
                                        value={note.expectedDeliveryDate || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.expectedDeliveryDate}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Goods</label>
                                    <input
                                        type="text"
                                        name="goodsType"
                                        value={note.goodsType || ''}
                                        onChange={handleChange}
                                        list="goods-types"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter type of goods"
                                        required
                                    />
                                    <datalist id="goods-types">
                                        {commonGoodsTypes.map(type => <option key={type} value={type} />)}
                                    </datalist>
                                    {errors.goodsType && <p className="text-red-500 text-xs mt-1">{errors.goodsType}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Party & Freight Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Party & Freight Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Your Agency Name" 
                                        name="agencyName" 
                                        value={note.agencyName || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.agencyName}
                                        placeholder="Enter your agency name"
                                    />
                                    <Input 
                                        label="Truck Owner/Operator Name" 
                                        name="truckOwnerName" 
                                        value={note.truckOwnerName || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.truckOwnerName}
                                        placeholder="Enter truck owner name"
                                    />
                                </div>

                                <Input 
                                    label="Truck Owner Contact (Optional)" 
                                    name="truckOwnerContact" 
                                    value={note.truckOwnerContact || ''} 
                                    onChange={handleChange} 
                                    placeholder="Enter contact number"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Freight Rate (₹)" 
                                        name="freightRate" 
                                        type="number" 
                                        value={note.freightRate || 0} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.freightRate}
                                        min="0"
                                        step="0.01"
                                    />
                                    <Select 
                                        label="Freight Rate Type" 
                                        name="freightRateType" 
                                        value={note.freightRateType || 'per_trip'} 
                                        onChange={handleChange}
                                        options={[
                                            { value: 'per_trip', label: 'Per Trip' },
                                            { value: 'per_ton', label: 'Per Ton' },
                                            { value: 'per_km', label: 'Per KM' }
                                        ]}
                                        required 
                                    />
                                </div>

                                <Input 
                                    label="Additional Charges (₹)" 
                                    name="additionalCharges" 
                                    type="number" 
                                    value={note.additionalCharges || 0} 
                                    onChange={handleChange} 
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g., detention charges"
                                />
                            </div>
                        )}

                        {/* Step 4: Payment Details */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Payment Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select 
                                        label="Payment Mode" 
                                        name="paymentMode" 
                                        value={note.paymentMode || 'Cash'} 
                                        onChange={handleChange}
                                        options={[
                                            { value: 'Cash', label: 'Cash' },
                                            { value: 'UPI', label: 'UPI' },
                                            { value: 'Bank Transfer', label: 'Bank Transfer' },
                                            { value: 'Cheque', label: 'Cheque' },
                                            { value: 'Other', label: 'Other' }
                                        ]}
                                        required 
                                        error={errors.paymentMode}
                                    />
                                    <Input 
                                        label="Advance Amount (₹)" 
                                        name="advanceAmount" 
                                        type="number" 
                                        value={note.advanceAmount || 0} 
                                        onChange={handleChange} 
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <Textarea 
                                    label="Payment Terms" 
                                    name="paymentTerms" 
                                    value={note.paymentTerms || ''} 
                                    onChange={handleChange} 
                                    required 
                                    error={errors.paymentTerms}
                                    rows={3}
                                    placeholder="e.g., 50% advance, balance after delivery"
                                />

                                {/* Payment Summary */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4">Payment Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-semibold">
                                                {((note.freightRate || 0) + (note.additionalCharges || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Advance Paid (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                                                {(note.advanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Balance Amount (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-bold text-lg text-red-600">
                                                {balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Linked LR Number (Optional)" 
                                        name="linkedLR" 
                                        value={note.linkedLR || ''} 
                                        onChange={handleChange} 
                                        placeholder="Link to Lorry Receipt"
                                    />
                                    <Input 
                                        label="Linked Invoice Number (Optional)" 
                                        name="linkedInvoice" 
                                        value={note.linkedInvoice || ''} 
                                        onChange={handleChange} 
                                        placeholder="Link to Invoice"
                                    />
                                </div>

                                <Textarea 
                                    label="Remarks" 
                                    name="remarks" 
                                    value={note.remarks || ''} 
                                    onChange={handleChange} 
                                    rows={3} 
                                    placeholder="Any special instructions or notes..."
                                />
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 mt-6 border-t">
                            <div>
                                {currentStep > 1 && (
                                    <Button type="button" variant="secondary" onClick={prevStep}>
                                        ← Previous
                                    </Button>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
                                    Cancel
                                </Button>
                                {currentStep < 4 ? (
                                    <Button 
                                        type="button" 
                                        onClick={nextStep}
                                        disabled={!isStepValid(currentStep)}
                                    >
                                        Next →
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save THN'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};
