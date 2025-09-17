import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GstPayableBy } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { getCurrentDate } from '../services/utils';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { FormStep } from './ui/FormStep';
import { FormSection } from './ui/FormSection';
import { FormNavigation } from './ui/FormNavigation';
import { AutocompleteInput } from './ui/AutocompleteInput';
import { validateForm, commonRules, validateWeight, validateDateRange } from '../services/formValidation';
import { commonCities, commonGoodsTypes, commonPackingMethods } from '../constants/formData';
import { indianStates } from '../constants';

import type { LorryReceipt, Customer, Vehicle } from '../types';

interface LorryReceiptFormProps {
  onSave: (lr: Partial<LorryReceipt>) => Promise<void>;
  onCancel: () => void;
  customers: Customer[];
  vehicles: Vehicle[];
  existingLr?: LorryReceipt;
  onSaveCustomer: (customer: Omit<Customer, 'id' | '_id'> & { _id?: string }) => Promise<Customer>;
  lorryReceipts: LorryReceipt[];
  onSaveVehicle: (vehicle: Omit<Vehicle, 'id' | '_id'>) => Promise<Vehicle>;
}

type LorryReceiptFormData = Omit<LorryReceipt, '_id' | 'id' | 'status' | 'consignor' | 'consignee' | 'vehicle'>;

const steps = [
    { title: 'Basic Info', description: 'Date, parties, and vehicle' },
    { title: 'Cargo Details', description: 'Packages and route' },
    { title: 'Financial', description: 'Charges and payment' },
    { title: 'Additional', description: 'Insurance and other details' }
];

export const LorryReceiptFormImproved: React.FC<LorryReceiptFormProps> = ({ 
    onSave, 
    onCancel, 
    customers, 
    vehicles, 
    existingLr, 
    onSaveCustomer, 
    lorryReceipts, 
    onSaveVehicle 
}) => {
    const getInitialState = (): LorryReceiptFormData => ({
        date: getCurrentDate(),
        consignorId: '',
        consigneeId: '',
        vehicleId: '',
        from: '',
        to: '',
        packages: [{ count: 1, packingMethod: '', description: '', actualWeight: 0, chargedWeight: 0 }],
        charges: { freight: 0, aoc: 0, hamali: 0, bCh: 0, trCh: 0, detentionCh: 0 },
        totalAmount: 0,
        eWayBillNo: '',
        valueGoods: 0,
        gstPayableBy: GstPayableBy.CONSIGNOR,
        insurance: { hasInsured: false },
        invoiceNo: '',
        sealNo: '',
        reportingDate: '',
        deliveryDate: '',
    });

    const [lr, setLr] = useState<Partial<LorryReceipt>>(existingLr ? { ...existingLr } : getInitialState());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Get unique locations from existing LRs
    const uniqueLocations = useMemo(() => {
        const locations = new Set<string>();
        lorryReceipts.forEach(lr => {
            if (lr.from) locations.add(lr.from.trim());
            if (lr.to) locations.add(lr.to.trim());
        });
        return Array.from(locations).sort();
    }, [lorryReceipts]);

    // Calculate total amount
    const calculateTotal = useCallback(() => {
        if (!lr.charges) return 0;
        const { freight = 0, aoc = 0, hamali = 0, bCh = 0, trCh = 0, detentionCh = 0 } = lr.charges;
        return freight + aoc + hamali + bCh + trCh + detentionCh;
    }, [lr.charges]);

    // Update total when charges change
    useEffect(() => {
        const total = calculateTotal();
        setLr(prev => ({ ...prev, totalAmount: total }));
    }, [calculateTotal]);

    // Validation rules
    const validationRules = {
        date: commonRules.required,
        consignorId: commonRules.required,
        consigneeId: commonRules.required,
        vehicleId: commonRules.required,
        from: commonRules.required,
        to: commonRules.required,
        'packages.0.count': { required: true, min: 1, message: 'Package count must be at least 1' },
        'packages.0.description': commonRules.required,
        'packages.0.actualWeight': { required: true, custom: validateWeight },
        'packages.0.chargedWeight': { required: true, custom: validateWeight },
        freight: { required: true, min: 0, message: 'Freight amount is required' },
        valueGoods: { min: 0, message: 'Value of goods must be positive' }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        setLr(prev => {
            const updatedLr = {
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value,
            };

            // Handle nested package updates
            if (name.startsWith('packages.')) {
                const [_, index, field] = name.split('.');
                const packageIndex = parseInt(index);
                const updatedPackages = [...(prev.packages || [])];
                updatedPackages[packageIndex] = {
                    ...updatedPackages[packageIndex],
                    [field]: type === 'number' ? parseFloat(value) || 0 : value
                };
                return { ...updatedLr, packages: updatedPackages };
            }

            // Handle nested charges updates
            if (name.startsWith('charges.')) {
                const field = name.split('.')[1];
                return {
                    ...updatedLr,
                    charges: {
                        ...prev.charges,
                        [field]: type === 'number' ? parseFloat(value) || 0 : value
                    }
                };
            }

            return updatedLr;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm(lr, validationRules);
        
        // Additional custom validations
        if (lr.date && lr.deliveryDate) {
            const dateError = validateDateRange(lr.date, lr.deliveryDate);
            if (dateError) {
                formErrors.deliveryDate = dateError;
            }
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            // Focus on first error field
            const firstErrorField = Object.keys(formErrors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            element?.focus();
            return;
        }

        setIsSaving(true);
        try {
            await onSave(lr);
        } catch (error) {
            console.error('Failed to save Lorry Receipt', error);
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
                return !!(lr.date && lr.consignorId && lr.consigneeId && lr.vehicleId);
            case 2:
                return !!(lr.from && lr.to && lr.packages?.[0]?.description && lr.packages?.[0]?.actualWeight);
            case 3:
                return !!(lr.charges?.freight && lr.charges.freight > 0);
            case 4:
                return true; // Additional details are optional
            default:
                return false;
        }
    };

    const addPackage = () => {
        setLr(prev => ({
            ...prev,
            packages: [...(prev.packages || []), { count: 1, packingMethod: '', description: '', actualWeight: 0, chargedWeight: 0 }]
        }));
    };

    const removePackage = (index: number) => {
        setLr(prev => ({
            ...prev,
            packages: prev.packages?.filter((_, i) => i !== index) || []
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={existingLr ? `Edit Lorry Receipt #${existingLr.lrNumber}` : 'Create New Lorry Receipt'}>
                        <FormStep 
                            currentStep={currentStep} 
                            totalSteps={4} 
                            steps={steps}
                        />

                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Date" 
                                        name="date" 
                                        type="date" 
                                        value={lr.date || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.date}
                                    />
                                    <Input 
                                        label="LR Number" 
                                        name="lrNumber" 
                                        type="text" 
                                        value={lr.lrNumber || ''} 
                                        onChange={handleChange} 
                                        placeholder="Auto-generated if empty"
                                        disabled
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Select 
                                            label="Consignor" 
                                            name="consignorId" 
                                            value={lr.consignorId || ''} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.consignorId}
                                        >
                                            <option value="">Select Consignor</option>
                                            {customers.map(customer => (
                                                <option key={customer._id} value={customer._id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <Select 
                                            label="Consignee" 
                                            name="consigneeId" 
                                            value={lr.consigneeId || ''} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.consigneeId}
                                        >
                                            <option value="">Select Consignee</option>
                                            {customers.map(customer => (
                                                <option key={customer._id} value={customer._id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Select 
                                        label="Vehicle" 
                                        name="vehicleId" 
                                        value={lr.vehicleId || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.vehicleId}
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(vehicle => (
                                            <option key={vehicle._id} value={vehicle._id}>
                                                {vehicle.number}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Cargo Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Cargo Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AutocompleteInput
                                        label="From"
                                        name="from"
                                        value={lr.from || ''}
                                        onChange={handleChange}
                                        options={[...commonCities, ...uniqueLocations]}
                                        placeholder="Enter origin city"
                                        required
                                        error={errors.from}
                                    />
                                    <AutocompleteInput
                                        label="To"
                                        name="to"
                                        value={lr.to || ''}
                                        onChange={handleChange}
                                        options={[...commonCities, ...uniqueLocations]}
                                        placeholder="Enter destination city"
                                        required
                                        error={errors.to}
                                    />
                                </div>

                                <FormSection title="Packages" variant="gray">
                                    {lr.packages?.map((pkg, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h5 className="font-medium text-gray-700">Package {index + 1}</h5>
                                                {lr.packages && lr.packages.length > 1 && (
                                                    <Button 
                                                        type="button" 
                                                        variant="secondary" 
                                                        onClick={() => removePackage(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <Input 
                                                    label="Count" 
                                                    name={`packages.${index}.count`} 
                                                    type="number" 
                                                    value={pkg.count || 0} 
                                                    onChange={handleChange} 
                                                    required 
                                                    min="1"
                                                    error={errors[`packages.${index}.count`]}
                                                />
                                                <AutocompleteInput
                                                    label="Packing Method"
                                                    name={`packages.${index}.packingMethod`}
                                                    value={pkg.packingMethod || ''}
                                                    onChange={handleChange}
                                                    options={commonPackingMethods}
                                                    placeholder="e.g., Cartons, Bags"
                                                />
                                                <Input 
                                                    label="Actual Weight (kg)" 
                                                    name={`packages.${index}.actualWeight`} 
                                                    type="number" 
                                                    value={pkg.actualWeight || 0} 
                                                    onChange={handleChange} 
                                                    required 
                                                    min="0"
                                                    step="0.1"
                                                    error={errors[`packages.${index}.actualWeight`]}
                                                />
                                                <Input 
                                                    label="Charged Weight (kg)" 
                                                    name={`packages.${index}.chargedWeight`} 
                                                    type="number" 
                                                    value={pkg.chargedWeight || 0} 
                                                    onChange={handleChange} 
                                                    required 
                                                    min="0"
                                                    step="0.1"
                                                    error={errors[`packages.${index}.chargedWeight`]}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <Textarea 
                                                    label="Description" 
                                                    name={`packages.${index}.description`} 
                                                    value={pkg.description || ''} 
                                                    onChange={handleChange} 
                                                    required 
                                                    rows={2}
                                                    placeholder="Describe the goods being transported"
                                                    error={errors[`packages.${index}.description`]}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        onClick={addPackage}
                                        className="w-full"
                                    >
                                        + Add Another Package
                                    </Button>
                                </FormSection>
                            </div>
                        )}

                        {/* Step 3: Financial Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Financial Details</h3>
                                
                                <FormSection title="Charges" variant="gray">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input 
                                            label="Freight (₹)" 
                                            name="charges.freight" 
                                            type="number" 
                                            value={lr.charges?.freight || 0} 
                                            onChange={handleChange} 
                                            required 
                                            min="0"
                                            step="0.01"
                                            error={errors.freight}
                                        />
                                        <Input 
                                            label="AOC (₹)" 
                                            name="charges.aoc" 
                                            type="number" 
                                            value={lr.charges?.aoc || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="Hamali (₹)" 
                                            name="charges.hamali" 
                                            type="number" 
                                            value={lr.charges?.hamali || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="B. Ch. (₹)" 
                                            name="charges.bCh" 
                                            type="number" 
                                            value={lr.charges?.bCh || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="Tr. Ch. (₹)" 
                                            name="charges.trCh" 
                                            type="number" 
                                            value={lr.charges?.trCh || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                        <Input 
                                            label="Detention Ch. (₹)" 
                                            name="charges.detentionCh" 
                                            type="number" 
                                            value={lr.charges?.detentionCh || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </FormSection>

                                <FormSection title="Payment Summary" variant="green">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-bold text-lg text-green-600">
                                                {calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <Input 
                                            label="Value of Goods (₹)" 
                                            name="valueGoods" 
                                            type="number" 
                                            value={lr.valueGoods || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                            error={errors.valueGoods}
                                        />
                                    </div>
                                </FormSection>
                            </div>
                        )}

                        {/* Step 4: Additional Details */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="E-Way Bill No." 
                                        name="eWayBillNo" 
                                        value={lr.eWayBillNo || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter E-Way Bill number"
                                    />
                                    <Input 
                                        label="Invoice No." 
                                        name="invoiceNo" 
                                        value={lr.invoiceNo || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter invoice number"
                                    />
                                    <Input 
                                        label="Seal No." 
                                        name="sealNo" 
                                        value={lr.sealNo || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter seal number"
                                    />
                                    <Select 
                                        label="GST Payable By" 
                                        name="gstPayableBy" 
                                        value={lr.gstPayableBy || GstPayableBy.CONSIGNOR} 
                                        onChange={handleChange}
                                    >
                                        <option value={GstPayableBy.CONSIGNOR}>Consignor</option>
                                        <option value={GstPayableBy.CONSIGNEE}>Consignee</option>
                                        <option value={GstPayableBy.TRANSPORTER}>Transporter</option>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Reporting Date" 
                                        name="reportingDate" 
                                        type="date" 
                                        value={lr.reportingDate || ''} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Delivery Date" 
                                        name="deliveryDate" 
                                        type="date" 
                                        value={lr.deliveryDate || ''} 
                                        onChange={handleChange} 
                                        error={errors.deliveryDate}
                                    />
                                </div>

                                <FormSection title="Insurance Details" variant="blue">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="hasInsured"
                                                checked={lr.insurance?.hasInsured || false}
                                                onChange={(e) => setLr(prev => ({
                                                    ...prev,
                                                    insurance: {
                                                        ...prev.insurance,
                                                        hasInsured: e.target.checked
                                                    }
                                                }))}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="hasInsured" className="ml-2 text-sm font-medium text-gray-700">
                                                Goods are insured
                                            </label>
                                        </div>
                                        
                                        {lr.insurance?.hasInsured && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input 
                                                    label="Insurance Company" 
                                                    name="insurance.company" 
                                                    value={lr.insurance?.company || ''} 
                                                    onChange={(e) => setLr(prev => ({
                                                        ...prev,
                                                        insurance: {
                                                            ...prev.insurance,
                                                            company: e.target.value
                                                        }
                                                    }))}
                                                />
                                                <Input 
                                                    label="Policy Number" 
                                                    name="insurance.policyNo" 
                                                    value={lr.insurance?.policyNo || ''} 
                                                    onChange={(e) => setLr(prev => ({
                                                        ...prev,
                                                        insurance: {
                                                            ...prev.insurance,
                                                            policyNo: e.target.value
                                                        }
                                                    }))}
                                                />
                                                <Input 
                                                    label="Insurance Date" 
                                                    name="insurance.date" 
                                                    type="date" 
                                                    value={lr.insurance?.date || ''} 
                                                    onChange={(e) => setLr(prev => ({
                                                        ...prev,
                                                        insurance: {
                                                            ...prev.insurance,
                                                            date: e.target.value
                                                        }
                                                    }))}
                                                />
                                                <Input 
                                                    label="Insurance Amount (₹)" 
                                                    name="insurance.amount" 
                                                    type="number" 
                                                    value={lr.insurance?.amount || 0} 
                                                    onChange={(e) => setLr(prev => ({
                                                        ...prev,
                                                        insurance: {
                                                            ...prev.insurance,
                                                            amount: parseFloat(e.target.value) || 0
                                                        }
                                                    }))}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </FormSection>
                            </div>
                        )}

                        <FormNavigation
                            currentStep={currentStep}
                            totalSteps={4}
                            onPrevious={prevStep}
                            onNext={nextStep}
                            onCancel={onCancel}
                            onSubmit={handleSubmit}
                            isSubmitting={isSaving}
                            canProceed={isStepValid(currentStep)}
                            showPrevious={currentStep > 1}
                            showNext={currentStep < 4}
                            showSubmit={currentStep === 4}
                            submitText="Save Lorry Receipt"
                        />
                    </Card>
                </form>
            </div>
        </div>
    );
};
