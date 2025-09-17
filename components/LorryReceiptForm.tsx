import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GstPayableBy, RiskBearer } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { getCurrentDate, fetchGstDetails } from '../services/utils';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { indianStates } from '../constants';

import type { LorryReceipt, Customer, Vehicle, TruckRental } from '../types';

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


const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <span className="ml-1.5 group relative cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 text-center">
            {text}
        </span>
    </span>
);

const NewCustomerSection: React.FC<{ onCustomerAdded: (customer: Customer) => void, onSaveCustomer: (customer: Partial<Customer>) => Promise<Customer> }> = ({ onCustomerAdded, onSaveCustomer }) => {
    const [mode, setMode] = useState<'closed' | 'gstin' | 'manual'>('closed');
    const [gstin, setGstin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [manualName, setManualName] = useState('');
    const [manualTradeName, setManualTradeName] = useState('');
    const [manualAddress, setManualAddress] = useState('');
    const [manualState, setManualState] = useState('');
    const [manualGstin, setManualGstin] = useState('');
    const [manualContactPerson, setManualContactPerson] = useState('');
    const [manualContactPhone, setManualContactPhone] = useState('');
    const [manualContactEmail, setManualContactEmail] = useState('');
    const [manualError, setManualError] = useState('');

    const handleFetch = async () => {
        if (!gstin || gstin.length !== 15) { 
            setFetchError('Please enter a valid 15-digit GSTIN.'); 
            return; 
        }
        setIsLoading(true); setFetchError('');
        try {
            const customerData = await fetchGstDetails(gstin);
            const newCustomer = await onSaveCustomer(customerData);
            onCustomerAdded(newCustomer);
            resetAndClose();
        } catch (err: any) {
            setFetchError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleManualSave = async () => {
        if (!manualName.trim() || !manualAddress.trim() || !manualState) { 
            setManualError('Legal Name, Address, and State are required.'); return; 
        }
        setManualError('');
        const customerData: Partial<Customer> = {
            name: manualName.trim(), 
            tradeName: manualTradeName.trim(),
            address: manualAddress.trim(), 
            state: manualState,
            gstin: manualGstin.trim(),
            contactPerson: manualContactPerson.trim(),
            contactPhone: manualContactPhone.trim(),
            contactEmail: manualContactEmail.trim(),
        };
        const newCustomer = await onSaveCustomer(customerData);
        onCustomerAdded(newCustomer);
        resetAndClose();
    };

    const resetAndClose = () => {
        setMode('closed'); setGstin(''); setFetchError(''); 
        setManualName(''); setManualTradeName(''); setManualAddress(''); setManualState(''); setManualGstin('');
        setManualContactPerson(''); setManualContactPhone(''); setManualContactEmail('');
        setManualError('');
    }

    if (mode === 'closed') {
        return (
            <div className="flex items-center ml-2 space-x-1">
                <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => setMode('gstin')}>Add via GST</Button>
                <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => setMode('manual')}>Add Manually</Button>
            </div>
        );
    }
    
    const formWrapperClasses = "mt-2 p-4 border rounded-lg absolute z-10 bg-white shadow-xl w-full max-w-lg right-0";

    if (mode === 'gstin') {
        return (
            <div className={formWrapperClasses}>
                <div className="flex items-start space-x-2">
                    <Input label="New Client GSTIN" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="Enter 15-digit GSTIN" wrapperClassName="flex-grow" error={fetchError} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button type="button" variant="secondary" onClick={resetAndClose}>Cancel</Button>
                    <Button type="button" onClick={handleFetch} disabled={isLoading}>{isLoading ? 'Fetching...' : 'Fetch & Save'}</Button>
                </div>
            </div>
        );
    }
    
    if (mode === 'manual') {
        return (
            <div className={`${formWrapperClasses} space-y-4`}>
                <h4 className="font-medium text-gray-800">Add New Client Manually</h4>
                {manualError && <p className="text-xs text-red-600 -mt-2">{manualError}</p>}
                <Input label="Legal Name*" value={manualName} onChange={e => setManualName(e.target.value)} />
                <Input label="Trade Name (Optional)" value={manualTradeName} onChange={e => setManualTradeName(e.target.value)} />
                <Textarea label="Address*" value={manualAddress} onChange={e => setManualAddress(e.target.value)} rows={3} />
                <Select label="State*" value={manualState} onChange={e => setManualState(e.target.value)}>
                    <option value="" disabled>Select State</option>
                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="GSTIN (Optional)" value={manualGstin} onChange={e => setManualGstin(e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <Input label="Contact Person" value={manualContactPerson} onChange={e => setManualContactPerson(e.target.value)} />
                    <Input label="Contact Phone" value={manualContactPhone} onChange={e => setManualContactPhone(e.target.value)} />
                    <Input label="Contact Email" type="email" value={manualContactEmail} onChange={e => setManualContactEmail(e.target.value)} wrapperClassName="md:col-span-2" />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={resetAndClose}>Cancel</Button>
                    <Button type="button" onClick={handleManualSave}>Save Client</Button>
                </div>
            </div>
        );
    }
    return null;
};

export const LorryReceiptForm: React.FC<LorryReceiptFormProps> = ({ onSave, onCancel, customers, vehicles, existingLr, onSaveCustomer, lorryReceipts, onSaveVehicle }) => {
  
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
    riskBearer: RiskBearer.CARRIER,
    insurance: { hasInsured: false },
    invoiceNo: '',
    sealNo: '',
    reportingDate: '',
    deliveryDate: '',
  });
    
  const [lr, setLr] = useState<Partial<LorryReceipt>>(existingLr ? { ...existingLr } : getInitialState());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  const [customNumber, setCustomNumber] = useState<string>('');
  
  const [vehicleNumber, setVehicleNumber] = useState(() => {
    if (existingLr && existingLr.vehicle) {
        return existingLr.vehicle.number;
    }
    return '';
  });

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    lorryReceipts.forEach(lr => {
      if (lr.from) locations.add(lr.from.trim());
      if (lr.to) locations.add(lr.to.trim());
    });
    return Array.from(locations).sort();
  }, [lorryReceipts]);

  const calculateTotal = useCallback(() => {
    if (!lr.charges) return 0;
    const { freight = 0, aoc = 0, hamali = 0, bCh = 0, trCh = 0, detentionCh = 0 } = lr.charges;
    return freight + aoc + hamali + bCh + trCh + detentionCh;
  }, [lr.charges]);

  useEffect(() => {
    setLr(prev => ({...prev, totalAmount: calculateTotal() }));
  }, [lr.charges, calculateTotal]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('charges.')) {
        const field = name.split('.')[1];
        setLr(prev => ({ ...prev, charges: { ...prev.charges, [field]: parseFloat(value) || 0 }}));
    } else if (name.startsWith('insurance.')) {
        const field = name.split('.')[1];
        if (field === 'hasInsured') {
             setLr(prev => ({ ...prev, insurance: { ...prev.insurance, hasInsured: (e.target as HTMLInputElement).checked }}));
        } else {
             setLr(prev => ({ ...prev, insurance: { ...prev.insurance, [field]: type === 'number' ? (parseFloat(value) || 0) : value }}));
        }
    }
    else {
        // Handle number fields properly
        const numberFields = ['valueGoods', 'totalAmount'];
        if (numberFields.includes(name)) {
            setLr(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setLr(prev => ({ ...prev, [name]: value }));
        }
    }
  };
  
  const handlePackageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newPackages = [...(lr.packages || [])];
    (newPackages[index] as any)[name] = type === 'number' ? parseFloat(value) || 0 : value;
    setLr(prev => ({...prev, packages: newPackages}));
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    console.log('Validating form with data:', lr);
    console.log('Vehicle number:', vehicleNumber);
    console.log('ConsignorId:', lr.consignorId);
    console.log('ConsigneeId:', lr.consigneeId);
    
    if (!lr.date) newErrors.date = 'Date is required.';
    if (!vehicleNumber.trim()) newErrors.vehicleId = 'Vehicle is required.';
    if (!lr.from) newErrors.from = 'Origin is required.';
    if (!lr.to) newErrors.to = 'Destination is required.';
    if (!lr.consignorId || lr.consignorId.trim() === '') newErrors.consignorId = 'Consignor is required.';
    if (!lr.consigneeId || lr.consigneeId.trim() === '') newErrors.consigneeId = 'Consignee is required.';
    if (!lr.packages || lr.packages.some(p => !p.count || !p.description || !p.packingMethod)) {
        newErrors.packages = 'Package count, description, and packing method are required for all package lines.';
    }
    if (useCustomNumber) {
        const n = parseInt(customNumber, 10);
        if (!Number.isInteger(n) || n <= 0) newErrors.lrNumber = 'Enter a valid positive LR number.';
        else if (lorryReceipts.some(x => x.lrNumber === n && x._id !== (existingLr?._id))) newErrors.lrNumber = 'LR number already exists.';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, validating...');
    const isValid = validate();
    console.log('Validation result:', isValid);
    if (isValid) {
      const trimmedVehicleNumber = vehicleNumber.trim();
      let vehicle = vehicles.find(v => v.number.toLowerCase() === trimmedVehicleNumber.toLowerCase());
      let finalVehicleId: string;

      if (vehicle) {
        finalVehicleId = vehicle._id;
      } else {
        const newVehicle = await onSaveVehicle({ number: trimmedVehicleNumber });
        finalVehicleId = newVehicle._id;
      }
      
      const lrDataToSave = {
        ...lr,
        vehicleId: finalVehicleId,
        ...(useCustomNumber ? { lrNumber: parseInt(customNumber, 10) } : {}),
      };

      console.log('Form data being sent:', lrDataToSave);
      console.log('ConsignorId:', lrDataToSave.consignorId);
      console.log('ConsigneeId:', lrDataToSave.consigneeId);
      console.log('VehicleId:', lrDataToSave.vehicleId);
      console.log('ValueGoods type:', typeof lrDataToSave.valueGoods, 'value:', lrDataToSave.valueGoods);
      console.log('TotalAmount type:', typeof lrDataToSave.totalAmount, 'value:', lrDataToSave.totalAmount);

      try {
        await onSave(lrDataToSave);
      } catch (err: any) {
        // Map backend zod fieldErrors to our local errors map
        const fe = err?.fieldErrors as Record<string, string[]> | undefined;
        if (fe) {
          const newErrors: { [key: string]: string } = {};
          Object.entries(fe).forEach(([key, messages]) => {
            // Attempt simple mapping from backend keys to our form keys
            // e.g., 'packages.0.count' -> 'packages'
            if (key.startsWith('packages')) newErrors.packages = messages.join(', ');
            else newErrors[key] = messages.join(', ');
          });
          setErrors(newErrors);
        }
      }
    } else {
      console.log('Form validation failed, not submitting');
    }
  };
  
  const selectedConsignor = existingLr?.consignor || customers.find(c => c._id === lr.consignorId);
  const selectedConsignee = existingLr?.consignee || customers.find(c => c._id === lr.consigneeId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <datalist id="locations-list">
        {uniqueLocations.map(location => (
          <option key={location} value={location} />
        ))}
      </datalist>
      <datalist id="vehicles-list">
        {vehicles.map(v => <option key={v._id} value={v.number} />)}
      </datalist>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{existingLr ? `Edit Lorry Receipt #${existingLr.lrNumber}` : 'Create Lorry Receipt'}</h2>
        <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">Total: ₹{(lr.totalAmount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <Card title="Shipment Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">LR Number</label>
                <div className="flex items-center space-x-3">
                    <input type="checkbox" id="lr-custom-num" checked={useCustomNumber} onChange={e => setUseCustomNumber(e.target.checked)} />
                    <label htmlFor="lr-custom-num" className="text-sm text-gray-700">Enter custom LR number</label>
                    {useCustomNumber && (
                        <input type="number" className="border border-gray-300 rounded px-2 py-1 w-40 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={customNumber} onChange={e => setCustomNumber(e.target.value)} placeholder="e.g. 1001" />
                    )}
                </div>
                {errors.lrNumber && <p className="text-xs text-red-600 mt-1">{errors.lrNumber}</p>}
            </div>
            <Input label="Date" type="date" name="date" value={lr.date || ''} onChange={handleChange} required error={errors.date} />
            <Input
              label="Vehicle No."
              name="vehicleNumber"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
              error={errors.vehicleId}
              list="vehicles-list"
              wrapperClassName="md:col-span-1"
            />
            <Input label="From" name="from" value={lr.from || ''} onChange={handleChange} required error={errors.from} list="locations-list" />
            <Input label="To" name="to" value={lr.to || ''} onChange={handleChange} required error={errors.to} list="locations-list" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Consignor">
            <div className="relative">
                <div className="flex items-center">
                    <Select name="consignorId" label="Select Consignor" value={lr.consignorId || ''} onChange={handleChange} required error={errors.consignorId}>
                        <option value="" disabled>Select Consignor</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.tradeName || c.name}</option>)}
                    </Select>
                    <NewCustomerSection onSaveCustomer={onSaveCustomer as any} onCustomerAdded={(c) => setLr(prev => ({...prev, consignorId: c._id}))}/>
                </div>
                {selectedConsignor && (
                    <div className="text-sm p-3 bg-slate-50 rounded-lg mt-4 space-y-2">
                        <div>
                           <p className="font-bold text-base">{selectedConsignor.name}</p>
                           {selectedConsignor.tradeName && <p className="text-gray-600 -mt-1 mb-1">({selectedConsignor.tradeName})</p>}
                           <p className="whitespace-pre-line">{selectedConsignor.address}</p>
                           <b>GST:</b> {selectedConsignor.gstin}
                        </div>
                        {(selectedConsignor.contactPerson || selectedConsignor.contactPhone || selectedConsignor.contactEmail) && (
                            <div className="pt-2 border-t">
                                {selectedConsignor.contactPerson && <p><b>Contact:</b> {selectedConsignor.contactPerson}</p>}
                                {selectedConsignor.contactPhone && <p><b>Phone:</b> {selectedConsignor.contactPhone}</p>}
                                {selectedConsignor.contactEmail && <p><b>Email:</b> {selectedConsignor.contactEmail}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
        <Card title="Consignee">
           <div className="relative">
                <div className="flex items-center">
                    <Select name="consigneeId" label="Select Consignee" value={lr.consigneeId || ''} onChange={handleChange} required error={errors.consigneeId}>
                        <option value="" disabled>Select Consignee</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.tradeName || c.name}</option>)}
                    </Select>
                    <NewCustomerSection onSaveCustomer={onSaveCustomer as any} onCustomerAdded={(c) => setLr(prev => ({...prev, consigneeId: c._id}))}/>
                </div>
                {selectedConsignee && (
                    <div className="text-sm p-3 bg-slate-50 rounded-lg mt-4 space-y-2">
                        <div>
                           <p className="font-bold text-base">{selectedConsignee.name}</p>
                           {selectedConsignee.tradeName && <p className="text-gray-600 -mt-1 mb-1">({selectedConsignee.tradeName})</p>}
                           <p className="whitespace-pre-line">{selectedConsignee.address}</p>
                           <b>GST:</b> {selectedConsignee.gstin}
                        </div>
                        {(selectedConsignee.contactPerson || selectedConsignee.contactPhone || selectedConsignee.contactEmail) && (
                            <div className="pt-2 border-t">
                                {selectedConsignee.contactPerson && <p><b>Contact:</b> {selectedConsignee.contactPerson}</p>}
                                {selectedConsignee.contactPhone && <p><b>Phone:</b> {selectedConsignee.contactPhone}</p>}
                                {selectedConsignee.contactEmail && <p><b>Email:</b> {selectedConsignee.contactEmail}</p>}
                            </div>
                        )}
                    </div>
                )}
           </div>
        </Card>
      </div>

      <Card title="Insurance">
        <div className="flex items-center mb-2">
            <input type="checkbox" id="hasInsured" name="insurance.hasInsured" checked={lr.insurance?.hasInsured || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="hasInsured" className="ml-3 block text-sm text-gray-900">The client has stated that they have insured the consignment.</label>
        </div>
        {lr.insurance?.hasInsured && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <Input label="Company" name="insurance.company" value={lr.insurance.company || ''} onChange={handleChange} />
                <Input label="Policy No." name="insurance.policyNo" value={lr.insurance.policyNo || ''} onChange={handleChange} />
                <Input label="Date" type="date" name="insurance.date" value={lr.insurance.date || ''} onChange={handleChange} />
                <Input label="Amount" type="number" name="insurance.amount" value={lr.insurance.amount || ''} onChange={handleChange} onFocus={e => e.target.select()} />
                <Input label="Risk" name="insurance.risk" value={lr.insurance.risk || ''} onChange={handleChange} />
            </div>
        )}
      </Card>

      <Card title="Packages">
        {(lr.packages || []).map((pkg, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4 border-b pb-4 last:border-b-0 last:pb-0">
              <Input label="No. of Pkgs" type="number" name="count" value={pkg.count} onChange={e => handlePackageChange(index, e)} onFocus={e => e.target.select()} />
              <Input label="Method of Packing" name="packingMethod" value={pkg.packingMethod} onChange={e => handlePackageChange(index, e)} />
              <Input label="Description" name="description" value={pkg.description} onChange={e => handlePackageChange(index, e)} wrapperClassName="md:col-span-3" />
              <Input label="Actual Weight" type="number" name="actualWeight" value={pkg.actualWeight} onChange={e => handlePackageChange(index, e)} onFocus={e => e.target.select()} />
              <Input label="Charged Weight" type="number" name="chargedWeight" value={pkg.chargedWeight} onChange={e => handlePackageChange(index, e)} onFocus={e => e.target.select()} />
          </div>
        ))}
        {errors.packages && <p className="mt-1 text-xs text-red-600">{errors.packages}</p>}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Other Details">
            <div className="space-y-4">
                 <Input label="E-Way Bill No." name="eWayBillNo" value={lr.eWayBillNo || ''} onChange={handleChange} />
                 <Input label="Value of Goods" type="number" name="valueGoods" value={lr.valueGoods || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                 <Input label="Invoice No." name="invoiceNo" value={lr.invoiceNo || ''} onChange={handleChange} />
                 <Input label="Seal No." name="sealNo" value={lr.sealNo || ''} onChange={handleChange} />
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Reporting Date" type="date" name="reportingDate" value={lr.reportingDate || ''} onChange={handleChange} />
                    <Input label="Delivery Date" type="date" name="deliveryDate" value={lr.deliveryDate || ''} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Select label="GST Payable By" name="gstPayableBy" value={lr.gstPayableBy || GstPayableBy.CONSIGNOR} onChange={handleChange}>
                       {Object.values(GstPayableBy).map(val => <option key={val} value={val}>{val}</option>)}
                    </Select>
                    <Select label="Risk Bearer" name="riskBearer" value={lr.riskBearer || RiskBearer.CARRIER} onChange={handleChange}>
                       {Object.values(RiskBearer).map(val => <option key={val} value={val}>{val}</option>)}
                    </Select>
                 </div>
            </div>
        </Card>
        <Card title="Charges">
            <div className="space-y-4">
                <Input label="Freight" type="number" name="charges.freight" value={lr.charges?.freight || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                <div className="flex items-center"><Input wrapperClassName="flex-grow" label="AOC" type="number" name="charges.aoc" value={lr.charges?.aoc || 0} onChange={handleChange} onFocus={e => e.target.select()} /><Tooltip text="Additional Operating Charges" /></div>
                <div className="flex items-center"><Input wrapperClassName="flex-grow" label="Hamali" type="number" name="charges.hamali" value={lr.charges?.hamali || 0} onChange={handleChange} onFocus={e => e.target.select()} /><Tooltip text="Loading/Unloading Charges" /></div>
                <Input label="B. Ch." type="number" name="charges.bCh" value={lr.charges?.bCh || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                <Input label="Tr. Ch." type="number" name="charges.trCh" value={lr.charges?.trCh || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                <div className="flex items-center"><Input wrapperClassName="flex-grow" label="Detention Ch." type="number" name="charges.detentionCh" value={lr.charges?.detentionCh || 0} onChange={handleChange} onFocus={e => e.target.select()} /><Tooltip text="Detention Charges" /></div>
            </div>
        </Card>
      </div>
      
      <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t -mx-6 px-6 py-3 flex justify-end space-x-3 shadow-sm">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Lorry Receipt</Button>
      </div>
    </form>
  );
};