import React, { useState, useEffect, useCallback } from 'react';
import type { Invoice, LorryReceipt, Customer, CompanyInfo } from '../types';
import { GstType, InvoiceStatus } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { FormStep } from './ui/FormStep';
import { FormSection } from './ui/FormSection';
import { FormNavigation } from './ui/FormNavigation';
import { validateForm, commonRules } from '../services/formValidation';
import { numberToWords, formatDate, getCurrentDate } from '../services/utils';

interface InvoiceFormProps {
  onSave: (invoice: Partial<Invoice>) => void;
  onCancel: () => void;
  availableLrs: LorryReceipt[];
  customers: Customer[];
  companyInfo: CompanyInfo;
  existingInvoice?: Invoice;
  preselectedLr?: LorryReceipt;
}

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; }> = ({ label, checked, onChange, disabled }) => (
    <label className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-3 text-sm font-medium text-gray-700">{label}</div>
    </label>
);

const steps = [
    { title: 'Basic Info', description: 'Customer and invoice details' },
    { title: 'Select LRs', description: 'Choose lorry receipts to invoice' },
    { title: 'GST Settings', description: 'Configure GST and calculations' },
    { title: 'Review', description: 'Review and finalize invoice' }
];

export const InvoiceFormImproved: React.FC<InvoiceFormProps> = ({ 
    onSave, 
    onCancel, 
    availableLrs, 
    customers, 
    companyInfo, 
    existingInvoice, 
    preselectedLr 
}) => {
    const [invoice, setInvoice] = useState<Partial<Invoice>>(
        existingInvoice
        ? { ...existingInvoice }
        : {
            date: getCurrentDate(),
            customerId: '',
            lorryReceipts: preselectedLr ? [preselectedLr] : [],
            totalAmount: 0,
            remarks: '',
            gstType: GstType.IGST,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 18,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            grandTotal: 0,
            isRcm: false,
            isManualGst: false,
            status: InvoiceStatus.UNPAID,
        }
    );

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Calculate totals
    const calculateTotals = useCallback(() => {
        const totalAmount = invoice.lorryReceipts?.reduce((sum, lr) => sum + (lr.totalAmount || 0), 0) || 0;
        const gstRate = invoice.gstType === GstType.CGST_SGST ? (invoice.cgstRate || 0) + (invoice.sgstRate || 0) : (invoice.igstRate || 0);
        const gstAmount = (totalAmount * gstRate) / 100;
        
        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;
        
        if (invoice.gstType === GstType.CGST_SGST) {
            cgstAmount = gstAmount / 2;
            sgstAmount = gstAmount / 2;
        } else {
            igstAmount = gstAmount;
        }
        
        const grandTotal = totalAmount + gstAmount;
        
        setInvoice(prev => ({
            ...prev,
            totalAmount,
            cgstAmount,
            sgstAmount,
            igstAmount,
            grandTotal
        }));
    }, [invoice.lorryReceipts, invoice.gstType, invoice.cgstRate, invoice.sgstRate, invoice.igstRate]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    // Validation rules
    const validationRules = {
        date: commonRules.required,
        customerId: commonRules.required,
        'lorryReceipts': {
            custom: (value: LorryReceipt[]) => {
                if (!value || value.length === 0) {
                    return 'At least one lorry receipt must be selected';
                }
                return null;
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        setInvoice(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleLrToggle = (lr: LorryReceipt) => {
        setInvoice(prev => {
            const currentLrs = prev.lorryReceipts || [];
            const isSelected = currentLrs.some(selectedLr => selectedLr._id === lr._id);
            
            if (isSelected) {
                return {
                    ...prev,
                    lorryReceipts: currentLrs.filter(selectedLr => selectedLr._id !== lr._id)
                };
            } else {
                return {
                    ...prev,
                    lorryReceipts: [...currentLrs, lr]
                };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm(invoice, validationRules);
        
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
            onSave(invoice);
        } catch (error) {
            console.error('Failed to save invoice', error);
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
                return !!(invoice.date && invoice.customerId);
            case 2:
                return !!(invoice.lorryReceipts && invoice.lorryReceipts.length > 0);
            case 3:
                return true; // GST settings are optional
            case 4:
                return true; // Review step
            default:
                return false;
        }
    };

    const selectedCustomer = customers.find(c => c._id === invoice.customerId);
    const isInterState = selectedCustomer?.state !== companyInfo.state;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={existingInvoice ? `Edit Invoice #${existingInvoice.invoiceNumber}` : 'Create New Invoice'}>
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
                                        label="Invoice Date" 
                                        name="date" 
                                        type="date" 
                                        value={invoice.date || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.date}
                                    />
                                    <Input 
                                        label="Invoice Number" 
                                        name="invoiceNumber" 
                                        type="text" 
                                        value={invoice.invoiceNumber || ''} 
                                        onChange={handleChange} 
                                        placeholder="Auto-generated if empty"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Select 
                                        label="Customer" 
                                        name="customerId" 
                                        value={invoice.customerId || ''} 
                                        onChange={handleChange} 
                                        required 
                                        error={errors.customerId}
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer._id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {selectedCustomer && (
                                    <FormSection title="Customer Details" variant="gray">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedCustomer.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">State</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedCustomer.state}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedCustomer.address}</p>
                                            </div>
                                        </div>
                                        
                                        {isInterState && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                <p className="text-sm text-blue-700">
                                                    <strong>Note:</strong> This is an inter-state transaction. IGST will be applied.
                                                </p>
                                            </div>
                                        )}
                                    </FormSection>
                                )}

                                <Textarea 
                                    label="Remarks" 
                                    name="remarks" 
                                    value={invoice.remarks || ''} 
                                    onChange={handleChange} 
                                    rows={3}
                                    placeholder="Additional notes or remarks for this invoice"
                                />
                            </div>
                        )}

                        {/* Step 2: Select Lorry Receipts */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Select Lorry Receipts</h3>
                                
                                <FormSection title="Available Lorry Receipts" variant="gray">
                                    <div className="space-y-4">
                                        {availableLrs.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No available lorry receipts found.</p>
                                        ) : (
                                            availableLrs.map(lr => {
                                                const isSelected = invoice.lorryReceipts?.some(selectedLr => selectedLr._id === lr._id) || false;
                                                return (
                                                    <div 
                                                        key={lr._id} 
                                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                            isSelected 
                                                                ? 'border-blue-500 bg-blue-50' 
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        onClick={() => handleLrToggle(lr)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => handleLrToggle(lr)}
                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                    />
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900">LR #{lr.lrNumber}</h4>
                                                                        <p className="text-sm text-gray-600">
                                                                            {lr.from} → {lr.to} • {formatDate(lr.date)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">
                                                                    ₹{(lr.totalAmount || 0).toLocaleString('en-IN')}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {lr.packages?.length || 0} packages
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </FormSection>

                                {invoice.lorryReceipts && invoice.lorryReceipts.length > 0 && (
                                    <FormSection title="Selected Lorry Receipts" variant="green">
                                        <div className="space-y-2">
                                            {invoice.lorryReceipts.map(lr => (
                                                <div key={lr._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                                    <span className="text-sm font-medium">LR #{lr.lrNumber}</span>
                                                    <span className="text-sm text-gray-600">₹{(lr.totalAmount || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center py-2 font-semibold text-lg border-t border-gray-300">
                                                <span>Total Amount</span>
                                                <span>₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </FormSection>
                                )}
                            </div>
                        )}

                        {/* Step 3: GST Settings */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">GST Settings</h3>
                                
                                <FormSection title="GST Configuration" variant="blue">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-6">
                                            <ToggleSwitch
                                                label="Reverse Charge Mechanism (RCM)"
                                                checked={invoice.isRcm || false}
                                                onChange={(checked) => setInvoice(prev => ({ ...prev, isRcm: checked }))}
                                            />
                                            <ToggleSwitch
                                                label="Manual GST Calculation"
                                                checked={invoice.isManualGst || false}
                                                onChange={(checked) => setInvoice(prev => ({ ...prev, isManualGst: checked }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">GST Type</label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gstType"
                                                            value={GstType.CGST_SGST}
                                                            checked={invoice.gstType === GstType.CGST_SGST}
                                                            onChange={handleChange}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">CGST + SGST (Intra-state)</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gstType"
                                                            value={GstType.IGST}
                                                            checked={invoice.gstType === GstType.IGST}
                                                            onChange={handleChange}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">IGST (Inter-state)</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {invoice.gstType === GstType.CGST_SGST ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input 
                                                    label="CGST Rate (%)" 
                                                    name="cgstRate" 
                                                    type="number" 
                                                    value={invoice.cgstRate || 0} 
                                                    onChange={handleChange} 
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                />
                                                <Input 
                                                    label="SGST Rate (%)" 
                                                    name="sgstRate" 
                                                    type="number" 
                                                    value={invoice.sgstRate || 0} 
                                                    onChange={handleChange} 
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <Input 
                                                    label="IGST Rate (%)" 
                                                    name="igstRate" 
                                                    type="number" 
                                                    value={invoice.igstRate || 0} 
                                                    onChange={handleChange} 
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </FormSection>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Review Invoice</h3>
                                
                                <FormSection title="Invoice Summary" variant="green">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                                                <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.date || '')}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Customer</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedCustomer?.name}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Selected Lorry Receipts</label>
                                            <div className="mt-1 space-y-1">
                                                {invoice.lorryReceipts?.map(lr => (
                                                    <p key={lr._id} className="text-sm text-gray-900">
                                                        LR #{lr.lrNumber} - ₹{(lr.totalAmount || 0).toLocaleString('en-IN')}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Financial Summary" variant="blue">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Sub Total:</span>
                                            <span>₹{(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        
                                        {invoice.gstType === GstType.CGST_SGST && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span>CGST @ {(invoice.cgstRate || 0)}%:</span>
                                                    <span>₹{(invoice.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>SGST @ {(invoice.sgstRate || 0)}%:</span>
                                                    <span>₹{(invoice.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </>
                                        )}
                                        
                                        {invoice.gstType === GstType.IGST && (
                                            <div className="flex justify-between">
                                                <span>IGST @ {(invoice.igstRate || 0)}%:</span>
                                                <span>₹{(invoice.igstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                                            <span>Grand Total:</span>
                                            <span>₹{(invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-700">
                                            <strong>Amount in words:</strong> {numberToWords(Math.round(invoice.grandTotal || 0))} Rupees Only
                                        </p>
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
                            submitText="Create Invoice"
                        />
                    </Card>
                </form>
            </div>
        </div>
    );
};
