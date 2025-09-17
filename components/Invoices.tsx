import React, { useState, useMemo, useEffect } from 'react';
import type { Invoice, Customer, CompanyInfo, Payment } from '../types';
import { InvoiceStatus } from '../types';
import type { View } from '../App';
import { formatDate } from '../services/utils';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { InvoiceView } from './InvoicePDF';
import { UniversalPaymentForm } from './UniversalPaymentForm';
import { UniversalPaymentHistoryModal } from './UniversalPaymentHistoryModal';

interface InvoicesProps {
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  companyInfo: CompanyInfo;
  onViewChange: (view: View) => void;
  onDeleteInvoice: (id: string) => void;
  onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
  onBack: () => void;
  initialFilters?: Partial<Record<keyof InvoicesTableFilters, any>>;
}

interface InvoicesTableFilters {
    searchTerm: string;
    startDate: string;
    endDate: string;
    selectedCustomerId: string;
    status: InvoiceStatus[];
}

const invoiceStatusColors: { [key in InvoiceStatus]: string } = {
    [InvoiceStatus.UNPAID]: 'bg-red-100 text-red-800',
    [InvoiceStatus.PARTIALLY_PAID]: 'bg-yellow-100 text-yellow-800',
    [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
};

const PreviewModal: React.FC<{
  item: { type: 'INVOICE', data: Invoice };
  onClose: () => void;
  companyInfo: CompanyInfo;
  customers: Customer[];
}> = ({ item, onClose, companyInfo, customers }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
    }, 300); // Match animation duration
  };

  const modalAnimation = isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100';
  const backdropAnimation = isClosing ? 'opacity-0' : 'opacity-100';


  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${backdropAnimation}`}
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl max-h-[90vh] w-full max-w-4xl overflow-hidden flex flex-col transform transition-all duration-300 ease-in-out ${modalAnimation}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">{`Preview: Invoice #${item.data.invoiceNumber}`}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto bg-gray-200">
           <div className="p-4 sm:p-8 flex justify-center">
            {item.type === 'INVOICE' && item.data.customer && (
              <InvoiceView
                invoice={item.data as Invoice}
                companyInfo={companyInfo}
                customers={customers}
              />
            )}
           </div>
        </div>
      </div>
    </div>
  );
};


export const Invoices: React.FC<InvoicesProps> = ({ invoices, payments, customers, companyInfo, onViewChange, onDeleteInvoice, onSavePayment, onBack, initialFilters }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters?.endDate || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialFilters?.selectedCustomerId || '');
  const [status, setStatus] = useState<InvoiceStatus[]>(initialFilters?.status || []);
  const [previewItem, setPreviewItem] = useState<{type: 'INVOICE', data: Invoice} | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState<Invoice | null>(null);

  const handleOpenPaymentForm = (invoice: Invoice) => {
    console.log('Opening payment form for invoice:', JSON.stringify(invoice, null, 2));
    console.log('CustomerId:', invoice.customerId);
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentFormOpen(true);
  };

  const handleOpenHistoryModal = (invoice: Invoice) => {
    setSelectedInvoiceForHistory(invoice);
    setIsHistoryModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        const customerName = inv.customer?.name || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = searchTerm === '' ||
          inv.invoiceNumber.toString().includes(searchTerm) ||
          customerName.toLowerCase().includes(searchLower) ||
          inv.lorryReceipts.some(lr => lr.lrNumber.toString().includes(searchTerm));

        const invDate = new Date(inv.date);
        invDate.setHours(0, 0, 0, 0);

        const start = startDate ? new Date(startDate) : null;
        if(start) start.setHours(0,0,0,0);
        const end = endDate ? new Date(endDate) : null;
        if(end) end.setHours(0,0,0,0);

        const matchesStartDate = !start || invDate >= start;
        const matchesEndDate = !end || invDate <= end;
        const matchesCustomer = selectedCustomerId === '' || inv.customer?._id === selectedCustomerId;
        const matchesStatus = status.length === 0 || status.includes(inv.status);

        return matchesSearch && matchesStartDate && matchesEndDate && matchesCustomer && matchesStatus;
      })
      .sort((a, b) => b.invoiceNumber - a.invoiceNumber);
  }, [invoices, searchTerm, startDate, endDate, selectedCustomerId, status]);

  return (
    <div className="space-y-8">
      {isPaymentFormOpen && selectedInvoiceForPayment && (
        <UniversalPaymentForm
          invoiceId={selectedInvoiceForPayment._id}
          customerId={selectedInvoiceForPayment.customer?._id || selectedInvoiceForPayment.customerId}
          grandTotal={selectedInvoiceForPayment.grandTotal}
          balanceDue={selectedInvoiceForPayment.balanceDue || selectedInvoiceForPayment.grandTotal}
          onSave={onSavePayment}
          onClose={() => setIsPaymentFormOpen(false)}
          title={`Add Payment for Invoice #${selectedInvoiceForPayment.invoiceNumber}`}
        />
      )}
      {isHistoryModalOpen && selectedInvoiceForHistory && (
        <UniversalPaymentHistoryModal
          invoice={selectedInvoiceForHistory}
          payments={payments}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          companyInfo={companyInfo}
          customers={customers}
        />
      )}
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
            <div className="space-x-2">
              <Button onClick={() => onViewChange({ name: 'CREATE_INVOICE' })}>Create New Invoice</Button>
              <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
            </div>
        </div>
        <div className="sticky top-[72px] z-10 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              type="text"
              label="Search by Inv No, Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              wrapperClassName="md:col-span-2 lg:col-span-2"
            />
            <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <Select
              label="Client"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">All Clients</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
            <Select
                label="Status"
                value={status.length > 0 ? status[0] : ''}
                onChange={e => setStatus(e.target.value ? [e.target.value as InvoiceStatus] : [])}
            >
                <option value="">All Statuses</option>
                {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
         <div className="overflow-x-auto mt-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map(inv => (
                <tr key={inv._id} onClick={() => setPreviewItem({ type: 'INVOICE', data: inv })} className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.customer?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{(inv.grandTotal || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">₹{(inv.paidAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold text-right">₹{(inv.balanceDue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${invoiceStatusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {inv.status !== 'Paid' && (
                      <button onClick={(e) => { e.stopPropagation(); handleOpenPaymentForm(inv); }} className="text-blue-600 hover:text-blue-900 transition-colors">Add Payment</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleOpenHistoryModal(inv); }} className="text-gray-600 hover:text-gray-900 transition-colors">History</button>
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_INVOICE', id: inv._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View PDF</button>
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'EDIT_INVOICE', id: inv._id }); }} className="text-green-600 hover:text-green-900 transition-colors">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteInvoice(inv._id); }} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
