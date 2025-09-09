import React, { useState, useMemo, useEffect } from 'react';
import type { LorryReceipt, Invoice, Customer, Vehicle, CompanyInfo, Payment, PromissoryNote } from '../types';
import { LorryReceiptStatus, InvoiceStatus } from '../types';
import type { View } from '../App';
import { formatDate } from '../services/utils';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { InvoiceView } from './InvoicePDF';
import { LorryReceiptView } from './LorryReceiptPDF';
import { PaymentForm } from './PaymentForm';
import { PaymentHistoryModal } from './PaymentHistoryModal';


interface DashboardProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  vehicles: Vehicle[];
  companyInfo: CompanyInfo;
  onViewChange: (view: View) => void;
  onUpdateLrStatus: (id: string, status: LorryReceiptStatus) => void;
  onDeleteLr: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
}

const statusColors: { [key in LorryReceiptStatus]: string } = {
  [LorryReceiptStatus.CREATED]: 'bg-blue-100 text-blue-800',
  [LorryReceiptStatus.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800',
  [LorryReceiptStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [LorryReceiptStatus.INVOICED]: 'bg-purple-100 text-purple-800',
  [LorryReceiptStatus.PAID]: 'bg-pink-100 text-pink-800',
};

const invoiceStatusColors: { [key in InvoiceStatus]: string } = {
    [InvoiceStatus.UNPAID]: 'bg-red-100 text-red-800',
    [InvoiceStatus.PARTIALLY_PAID]: 'bg-yellow-100 text-yellow-800',
    [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
};


const PreviewModal: React.FC<{
  item: { type: 'LR', data: LorryReceipt } | { type: 'INVOICE', data: Invoice };
  onClose: () => void;
  companyInfo: CompanyInfo;
  customers: Customer[]; // Keep customers prop for now, might be needed by PDF views
  vehicles: Vehicle[];
}> = ({ item, onClose, companyInfo, customers, vehicles }) => {
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
          <h2 className="text-xl font-bold text-gray-800">{item.type === 'LR' ? `Preview: Lorry Receipt #${item.data.lrNumber}` : `Preview: Invoice #${item.data.invoiceNumber}`}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto bg-gray-200">
           <div className="p-4 sm:p-8 flex justify-center">
             {item.type === 'LR' && item.data.consignor && ( // Ensure data is populated
              <LorryReceiptView 
                lorryReceipt={item.data as LorryReceipt}
                companyInfo={companyInfo}
              />
            )}
            {item.type === 'INVOICE' && item.data.customer && ( // Ensure data is populated
              <InvoiceView 
                invoice={item.data as Invoice}
                companyInfo={companyInfo}
                customers={customers} // InvoiceView still uses this, can be refactored later
              />
            )}
           </div>
        </div>
      </div>
    </div>
  );
};


export const Dashboard: React.FC<DashboardProps> = ({ lorryReceipts, invoices, payments, customers, vehicles, companyInfo, onViewChange, onUpdateLrStatus, onDeleteLr, onDeleteInvoice, onSavePayment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [previewItem, setPreviewItem] = useState<{type: 'LR', data: LorryReceipt} | {type: 'INVOICE', data: Invoice} | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState<Invoice | null>(null);


  const handleOpenPaymentForm = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentFormOpen(true);
  };

  const handleOpenHistoryModal = (invoice: Invoice) => {
    setSelectedInvoiceForHistory(invoice);
    setIsHistoryModalOpen(true);
  };

  const filteredLrs = useMemo(() => {
    return lorryReceipts
      .filter(lr => {
        const consignorName = lr.consignor?.name || '';
        const consigneeName = lr.consignee?.name || '';

        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = searchTerm === '' ||
          lr.lrNumber.toString().includes(searchTerm) ||
          lr.from.toLowerCase().includes(searchLower) ||
          lr.to.toLowerCase().includes(searchLower) ||
          consignorName.toLowerCase().includes(searchLower) ||
          consigneeName.toLowerCase().includes(searchLower);

        const lrDate = new Date(lr.date);
        lrDate.setHours(0, 0, 0, 0);

        const start = startDate ? new Date(startDate) : null;
        if(start) start.setHours(0,0,0,0);
        const end = endDate ? new Date(endDate) : null;
        if(end) end.setHours(0,0,0,0);

        const matchesStartDate = !start || lrDate >= start;
        const matchesEndDate = !end || lrDate <= end;
        const matchesCustomer = selectedCustomerId === '' || 
          lr.consignor?._id === selectedCustomerId ||
          lr.consignee?._id === selectedCustomerId;
        const matchesStatus = selectedStatus === '' || lr.status === selectedStatus;

        return matchesSearch && matchesStartDate && matchesEndDate && matchesCustomer && matchesStatus;
      })
      .sort((a, b) => b.lrNumber - a.lrNumber); // Sort by new sequential ID
  }, [lorryReceipts, searchTerm, startDate, endDate, selectedCustomerId, selectedStatus]);

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

        return matchesSearch && matchesStartDate && matchesEndDate && matchesCustomer;
      })
      .sort((a, b) => b.invoiceNumber - a.invoiceNumber); // Sort by new sequential ID
  }, [invoices, searchTerm, startDate, endDate, selectedCustomerId]);

  return (
    <div className="space-y-8">
      {isPaymentFormOpen && selectedInvoiceForPayment && (
        <PaymentForm
          invoiceId={selectedInvoiceForPayment._id}
          customerId={selectedInvoiceForPayment.customerId}
          grandTotal={selectedInvoiceForPayment.grandTotal}
          balanceDue={selectedInvoiceForPayment.balanceDue || selectedInvoiceForPayment.grandTotal}
          onSave={onSavePayment}
          onClose={() => setIsPaymentFormOpen(false)}
        />
      )}
      {isHistoryModalOpen && selectedInvoiceForHistory && (
        <PaymentHistoryModal
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
          vehicles={vehicles}
        />
      )}
      <Card title="Dashboard Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            type="text"
            label="Search by LR/Inv No, Client, From, To..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            wrapperClassName="lg:col-span-3"
          />
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
           <Select
              label="Client"
              value={selectedCustomerId} 
              onChange={e => setSelectedCustomerId(e.target.value)} 
            >
              <option value="">All Clients</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
           <Select
              label="LR Status"
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(LorryReceiptStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Lorry Receipts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From / To</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLrs.map(lr => (
                <tr key={lr._id} onClick={() => setPreviewItem({ type: 'LR', data: lr })} className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lr.lrNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lr.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lr.consignor?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lr.consignee?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lr.from} to {lr.to}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{lr.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select 
                      value={lr.status} 
                      onClick={e => e.stopPropagation()}
                      onChange={(e) => onUpdateLrStatus(lr._id, e.target.value as LorryReceiptStatus)}
                      className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${statusColors[lr.status]} border-0 bg-opacity-80 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none`}
                    >
                      {Object.values(LorryReceiptStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {[LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status) && (
                        <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'CREATE_INVOICE_FROM_LR', lrId: lr._id }); }} className="text-blue-600 hover:text-blue-900 transition-colors">Create Invoice</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_LR', id: lr._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View PDF</button>
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'EDIT_LR', id: lr._id }); }} className="text-green-600 hover:text-green-900 transition-colors">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteLr(lr._id); }} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Invoices</h3>
        </div>
         <div className="overflow-x-auto mt-4">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{inv.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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