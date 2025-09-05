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

const BackupExport: React.FC<Omit<SettingsProps, 'companyInfo' | 'onSave' | 'onPasswordChange'>> = ({ lorryReceipts, invoices, payments, customers, vehicles }) => {
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v.number])), [vehicles]);

    const handleExportLrs = () => {
        const data = lorryReceipts.map(lr => ({
            'LR No': lr.id, 
            'Date': formatDate(lr.date),
            'Reporting Date': lr.reportingDate ? formatDate(lr.reportingDate) : '',
            'Delivery Date': lr.deliveryDate ? formatDate(lr.deliveryDate) : '',
            'Consignor': customerMap.get(lr.consignorId)?.name || '',
            'Consignee': customerMap.get(lr.consigneeId)?.name || '', 
            'Vehicle No': vehicleMap.get(lr.vehicleId) || '',
            'From': lr.from, 'To': lr.to, 'Packages': lr.packages.map(p => `${p.count} ${p.packingMethod} - ${p.description}`).join('; '),
            'Charged Weight': lr.packages.reduce((sum, p) => sum + p.chargedWeight, 0), 'Freight': lr.charges.freight,
            'AOC': lr.charges.aoc, 'Hamali': lr.charges.hamali, 'B Ch': lr.charges.bCh, 'Tr Ch': lr.charges.trCh,
            'Detention Ch': lr.charges.detentionCh, 'Total Amount': lr.totalAmount, 'Status': lr.status,
            'E-Way Bill No': lr.eWayBillNo, 'Value of Goods': lr.valueGoods, 'Invoice No': lr.invoiceNo
        }));
        exportToCsv('lorry-receipts-backup.csv', data);
    };

    const handleExportInvoices = () => {
        const data = invoices.map(inv => ({
            'Invoice No': inv.id, 'Date': formatDate(inv.date), 'Client': customerMap.get(inv.customerId)?.name || '',
            'LRs Included': inv.lorryReceipts.map(lr => lr.id).join(', '), 'Subtotal': inv.totalAmount,
            'GST Type': inv.gstType, 'CGST Amount': inv.cgstAmount, 'SGST Amount': inv.sgstAmount,
            'IGST Amount': inv.igstAmount, 'Grand Total': inv.grandTotal, 'Remarks': inv.remarks,
        }));
        exportToCsv('invoices-backup.csv', data);
    };
    
    const handleExportLedgers = () => {
        const allLedgerRows: any[] = [];
        customers.forEach(customer => {
            const customerInvoices = invoices.filter(inv => inv.customerId === customer.id).map(inv => ({
                type: 'invoice' as const, date: inv.date, particulars: `Invoice No: ${inv.id} (LRs: ${inv.lorryReceipts.map(lr => lr.id).join(', ')})`,
                debit: inv.grandTotal, credit: 0
            }));
            const customerPayments = payments.filter(p => p.customerId === customer.id).map(p => ({
                type: 'payment' as const, date: p.date, particulars: `${p.type} via ${p.mode}${p.referenceNo ? ` (${p.referenceNo})` : ''}${p.notes ? ` - ${p.notes}` : ''}`,
                debit: 0, credit: p.amount
            }));
            const transactions = [...customerInvoices, ...customerPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let runningBalance = 0;
            transactions.forEach(tx => {
                runningBalance += (tx.debit - tx.credit);
                allLedgerRows.push({
                    'Client': customer.name, 'Date': formatDate(tx.date), 'Particulars': tx.particulars,
                    'Debit': tx.debit || '', 'Credit': tx.credit || '', 'Balance': runningBalance.toFixed(2),
                });
            });
        });
        exportToCsv('all-customer-ledgers-backup.csv', allLedgerRows);
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
                 <Card className="flex flex-col items-start">
                    <h4 className="font-semibold text-lg">Client Ledgers</h4>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">Export the complete transaction history for all clients.</p>
                    <Button onClick={handleExportLedgers} variant="secondary">Export All Ledgers</Button>
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


export const Settings: React.FC<SettingsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('info')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Company Info</button>
                <button onClick={() => setActiveTab('export')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'export' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Backup & Export</button>
                <button onClick={() => setActiveTab('security')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Security</button>
            </nav>
        </div>
        <div className="pt-8">
            {activeTab === 'info' && <CompanyInfoForm companyInfo={props.companyInfo} onSave={props.onSave} />}
            {activeTab === 'export' && <BackupExport {...props} />}
            {activeTab === 'security' && <ChangePasswordForm onPasswordChange={props.onPasswordChange} />}
        </div>
    </Card>
  );
};