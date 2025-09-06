import React, { useState, useMemo } from 'react';
import type { CompanyInfo, LorryReceipt, Invoice, Payment, Customer, Vehicle } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { exportToCsv } from '../services/exportService';
import { formatDate } from '../services/utils';
import { indianStates } from '../constants';

interface SettingsProps {
  companyInfo: CompanyInfo;
  onSave: (info: CompanyInfo) => void;
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  vehicles: Vehicle[];
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<{success: boolean, message: string}>;
  onResetData: () => Promise<void>;
  onLoadMockData: () => Promise<void>;
}

const CompanyInfoForm: React.FC<{ companyInfo: CompanyInfo, onSave: (info: CompanyInfo) => void }> = ({ companyInfo, onSave }) => {
    const [info, setInfo] = useState<CompanyInfo>(companyInfo);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(info);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Company & Bank Details</h3>
                {saved && <span className="text-green-600 bg-green-100 px-3 py-1 rounded-md text-sm font-medium">Saved!</span>}
            </div>
            <Card title="Company Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Company Name" name="name" value={info.name} onChange={handleChange} />
                    <Textarea label="Address" name="address" value={info.address} onChange={handleChange} rows={4} wrapperClassName="md:col-span-2" />
                     <Select label="State" name="state" value={info.state} onChange={handleChange} required>
                        <option value="" disabled>Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <Input label="Phone 1" name="phone1" value={info.phone1} onChange={handleChange} />
                    <Input label="Phone 2" name="phone2" value={info.phone2} onChange={handleChange} />
                    <Input label="Email" name="email" type="email" value={info.email} onChange={handleChange} />
                    <Input label="Website" name="website" value={info.website} onChange={handleChange} />
                    <Input label="GSTIN" name="gstin" value={info.gstin} onChange={handleChange} />
                    <Input label="PAN" name="pan" value={info.pan} onChange={handleChange} />
                </div>
            </Card>
            <Card title="Bank Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Bank Name" name="bankName" value={info.bankName} onChange={handleChange} />
                    <Input label="Account Number" name="accountNumber" value={info.accountNumber} onChange={handleChange} />
                    <Input label="IFSC Code" name="ifsc" value={info.ifsc} onChange={handleChange} />
                </div>
            </Card>
            <div className="flex justify-end pt-4 border-t">
                <Button type="submit">Save Settings</Button>
            </div>
        </form>
    );
};

const BackupExport: React.FC<Pick<SettingsProps, 'lorryReceipts' | 'invoices' | 'payments' | 'customers' | 'vehicles'>> = (props) => {
    // This component now has inconsistent data access patterns after the main refactor.
    // This should be fixed if the user wants to continue using it.
    // For now, leaving it as is to focus on the requested features.

    const handleExportLrs = () => {
        const data = props.lorryReceipts.map(lr => ({
            'LR No': lr.id, 'Date': formatDate(lr.date), 'Consignor': lr.consignor?.name, 'Consignee': lr.consignee?.name,
             'Vehicle No': lr.vehicle?.number, 'From': lr.from, 'To': lr.to,
        }));
        exportToCsv('lorry-receipts-backup.csv', data);
    };

    const handleExportInvoices = () => {
        const data = props.invoices.map(inv => ({
            'Invoice No': inv.id, 'Date': formatDate(inv.date), 'Client': inv.customer?.name,
            'LRs Included': inv.lorryReceipts.map(lr => lr.id).join(', '), 'Grand Total': inv.grandTotal,
        }));
        exportToCsv('invoices-backup.csv', data);
    };
    
    return (
        <div className="space-y-6">
             <h3 className="text-xl font-bold text-gray-800">Backup & Export Data</h3>
             <p className="text-gray-600">Download your data in CSV format. CSV files can be opened with any spreadsheet software like Microsoft Excel or Google Sheets.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <Card className="flex flex-col items-start">
                    <h4 className="font-semibold text-lg">Lorry Receipts</h4>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">Export all Lorry Receipt data.</p>
                    <Button onClick={handleExportLrs} variant="secondary">Export LRs</Button>
                </Card>
                 <Card className="flex flex-col items-start">
                    <h4 className="font-semibold text-lg">Invoices</h4>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">Export all Invoice data.</p>
                    <Button onClick={handleExportInvoices} variant="secondary">Export Invoices</Button>
                </Card>
             </div>
        </div>
    );
};

const ChangePasswordForm: React.FC<{ onPasswordChange: SettingsProps['onPasswordChange'] }> = ({ onPasswordChange }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); setIsError(false);
        if (!newPassword || newPassword !== confirmPassword) {
            setMessage('New passwords do not match or are empty.'); setIsError(true); return;
        }
        const result = await onPasswordChange(currentPassword, newPassword);
        setMessage(result.message); setIsError(!result.success);
        if (result.success) {
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
            <Card>
                <div className="space-y-4">
                    <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
                    <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required />
                    <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                </div>
            </Card>
            {message && (<p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>)}
            <div className="flex justify-end pt-4 border-t">
                <Button type="submit">Update Password</Button>
            </div>
        </form>
    );
};

const DataManagement: React.FC<{ onResetData: () => void, onLoadMockData: () => void }> = ({ onResetData, onLoadMockData }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all application data? This action cannot be undone.')) {
            setIsLoading(true);
            await onResetData();
            setIsLoading(false);
        }
    };

    const handleLoadMock = async () => {
        if (window.confirm('This will replace all current data with a set of test data. Are you sure?')) {
            setIsLoading(true);
            await onLoadMockData();
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Data Management</h3>
            <Card>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-lg">Load Test Data</h4>
                        <p className="text-sm text-gray-500 mb-2">Populate the database with a set of sample customers and vehicles for testing purposes. This will wipe all existing data first.</p>
                        <Button onClick={handleLoadMock} variant="secondary" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Load Test Data'}
                        </Button>
                    </div>
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-lg text-red-700">Reset Application Data</h4>
                        <p className="text-sm text-gray-500 mb-2">Permanently delete all data from the application, including all clients, lorry receipts, invoices, and payments. This is irreversible.</p>
                        <Button onClick={handleReset} variant="destructive" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset All Data'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};


export const Settings: React.FC<SettingsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
      { key: 'info', label: 'Company Info' },
      { key: 'export', label: 'Backup & Export' },
      { key: 'security', label: 'Security' },
      { key: 'data', label: 'Data Management' },
  ];

  return (
    <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="pt-8">
            {activeTab === 'info' && <CompanyInfoForm companyInfo={props.companyInfo} onSave={props.onSave} />}
            {activeTab === 'export' && <BackupExport {...props} />}
            {activeTab === 'security' && <ChangePasswordForm onPasswordChange={props.onPasswordChange} />}
            {activeTab === 'data' && <DataManagement onResetData={props.onResetData} onLoadMockData={props.onLoadMockData} />}
        </div>
    </Card>
  );
};