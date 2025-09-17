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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);
    const formRef = useRef<HTMLFormElement>(null);

    // Common cities for autocomplete
    const commonCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
        'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
        'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
        'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar'
    ];

    // Common goods types
    const commonGoodsTypes = [
        'General Cargo', 'Textiles', 'Electronics', 'Machinery', 'Food Items', 'Pharmaceuticals',
        'Automotive Parts', 'Construction Materials', 'Agricultural Products', 'Chemicals',
        'Furniture', 'Books & Stationery', 'Garments', 'Footwear', 'Home Appliances'
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
        if (!note.transporterCompanyName?.trim()) newErrors.transporterCompanyName = 'Transporter/Company name is required';
        if (!note.truckNumber?.trim()) newErrors.truckNumber = 'Truck number is required';
        if (!note.origin?.trim()) newErrors.origin = 'Origin is required';
        if (!note.destination?.trim()) newErrors.destination = 'Destination is required';
        if (!note.goodsType?.trim()) newErrors.goodsType = 'Type of goods is required';
        if (!note.weight || note.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
        if (!note.freight || note.freight <= 0) newErrors.freight = 'Freight amount is required';
        if (!note.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Expected delivery date is required';
        
        // Validate dates
        if (note.date && note.expectedDeliveryDate) {
            const noteDate = new Date(note.date);
            const deliveryDate = new Date(note.expectedDeliveryDate);
            if (deliveryDate < noteDate) {
                newErrors.expectedDeliveryDate = 'Delivery date cannot be before note date';
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
        
        setNote(prev => {
            const updatedNote = {
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value,
            };
            
            // Calculate GST and totals when relevant fields change
            if (['freight', 'loadingCharges', 'unloadingCharges', 'detentionCharges', 'gstRate', 'origin', 'destination'].includes(name)) {
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
        if (currentStep < 3) {
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
                return !!(note.date && note.transporterCompanyName?.trim() && note.truckNumber?.trim() && note.expectedDeliveryDate);
            case 2:
                return !!(note.origin?.trim() && note.destination?.trim() && note.goodsType?.trim() && note.weight && note.weight > 0);
            case 3:
                return !!(note.freight && note.freight > 0);
            default:
                return false;
        }
    };

    const balancePayable = (note.grandTotal || 0) - (note.advancePaid || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8" onClick={e => e.stopPropagation()}>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <Card title={existingNote ? `Edit Truck Hiring Note #${existingNote.thnNumber}` : 'Create New Truck Hiring Note'}>
                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center space-x-4">
                                {[1, 2, 3].map((step) => (
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
                                            {step === 1 ? 'Basic Info' : step === 2 ? 'Cargo Details' : 'Financial'}
                                        </span>
                                        {step < 3 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input 
                                            label="Date" 
                                            name="date" 
                                            type="date" 
                                            value={note.date || ''} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.date}
                                        />
                                    </div>
                                    <div>
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
                                </div>

                                <div>
                                    <Input 
                                        label="Transporter/Company Name" 
                                        name="transporterCompanyName" 
                                        value={note.transporterCompanyName || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.transporterCompanyName}
                                        placeholder="Enter transporter or company name"
                                    />
                                </div>

                                <div>
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
                            </div>
                        )}

                        {/* Step 2: Cargo Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Cargo Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                                        <input
                                            type="text"
                                            name="origin"
                                            value={note.origin || ''}
                                            onChange={handleChange}
                                            list="origin-cities"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter origin city"
                                            required
                                        />
                                        <datalist id="origin-cities">
                                            {commonCities.map(city => <option key={city} value={city} />)}
                                        </datalist>
                                        {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                        <input
                                            type="text"
                                            name="destination"
                                            value={note.destination || ''}
                                            onChange={handleChange}
                                            list="destination-cities"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter destination city"
                                            required
                                        />
                                        <datalist id="destination-cities">
                                            {commonCities.map(city => <option key={city} value={city} />)}
                                        </datalist>
                                        {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div>
                                        <Input 
                                            label="Weight (kg)" 
                                            name="weight" 
                                            type="number" 
                                            value={note.weight || 0} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.weight}
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                </div>

                                {/* GST Type Indicator */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                <strong>GST Type:</strong> {note.origin === note.destination ? 'CGST + SGST (Intra-state)' : 'IGST (Inter-state)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Financial Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Financial Details</h3>
                                
                                {/* Payment Terms */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <Input 
                                        label="Reminders" 
                                        name="reminders" 
                                        value={note.reminders || ''} 
                                        onChange={handleChange} 
                                        placeholder="Payment reminders and notes" 
                                    />
                                </div>

                                {/* Basic Charges */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4">Charges</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input 
                                            label="Freight (₹)" 
                                            name="freight" 
                                            type="number" 
                                            value={note.freight || 0} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.freight}
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="Loading Charges (₹)" 
                                            name="loadingCharges" 
                                            type="number" 
                                            value={note.loadingCharges || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="Unloading Charges (₹)" 
                                            name="unloadingCharges" 
                                            type="number" 
                                            value={note.unloadingCharges || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="Detention Charges (₹)" 
                                            name="detentionCharges" 
                                            type="number" 
                                            value={note.detentionCharges || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                {/* GST Calculation */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4">GST Calculation</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input 
                                            label="GST Rate (%)" 
                                            name="gstRate" 
                                            type="number" 
                                            value={note.gstRate || 18} 
                                            onChange={handleChange} 
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Subtotal (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-semibold">
                                                {((note.freight || 0) + (note.loadingCharges || 0) + (note.unloadingCharges || 0) + (note.detentionCharges || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* GST Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">CGST (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                                                {(note.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">SGST (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                                                {(note.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">IGST (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                                                {(note.igstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total and Payment */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4">Payment Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total GST (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-semibold">
                                                {(note.totalGstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Grand Total (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-bold text-lg text-green-600">
                                                {(note.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <Input 
                                                label="Advance Paid (₹)" 
                                                name="advancePaid" 
                                                type="number" 
                                                value={note.advancePaid || 0} 
                                                onChange={handleChange} 
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    {/* Balance Payable */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">Balance Payable (₹)</label>
                                        <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-bold text-xl text-red-600">
                                            {balancePayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <Textarea 
                                        label="Special Instructions" 
                                        name="specialInstructions" 
                                        value={note.specialInstructions || ''} 
                                        onChange={handleChange} 
                                        rows={3} 
                                        placeholder="Any special instructions for the transporter..."
                                    />
                                </div>
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
                                {currentStep < 3 ? (
                                    <Button 
                                        type="button" 
                                        onClick={nextStep}
                                        disabled={!isStepValid(currentStep)}
                                    >
                                        Next →
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Note'}
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
