import React, { useMemo } from 'react';
import type { LorryReceipt, Invoice, Payment, TruckHiringNote } from '../types';
import { LorryReceiptStatus, InvoiceStatus } from '../types';
import type { View } from '../App';
import { formatDate } from '../services/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface DashboardProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
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

const KpiCard: React.FC<{ title: string; value: string | number; icon: string, onClick?: () => void }> = ({ title, value, icon, onClick }) => (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onClick}>
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
  </Card>
);

export const Dashboard: React.FC<DashboardProps> = ({ lorryReceipts, invoices, truckHiringNotes, onViewChange, onUpdateLrStatus, onDeleteLr, onDeleteInvoice }) => {
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalLrsToday = lorryReceipts.filter(lr => {
      const lrDate = new Date(lr.date);
      lrDate.setHours(0, 0, 0, 0);
      return lrDate.getTime() === today.getTime();
    }).length;

    const invoicedLrIds = new Set(invoices.flatMap(inv => inv.lorryReceipts.map(lr => lr._id)));
    const unbilledLrs = lorryReceipts.filter(lr => !invoicedLrIds.has(lr._id));

    const outstandingPayments = invoices.reduce((acc, inv) => {
        return acc + (inv.balanceDue || 0);
    }, 0);

    const totalFreightThisMonth = truckHiringNotes.filter(thn => {
        const thnDate = new Date(thn.date);
        return thnDate.getMonth() === today.getMonth() && thnDate.getFullYear() === today.getFullYear();
    }).reduce((acc, thn) => acc + thn.freight, 0);

    const outstandingSupplierPayments = truckHiringNotes.reduce((acc, thn) => acc + thn.balancePayable, 0);

    return {
      totalLrsToday,
      totalLrs: lorryReceipts.length,
      totalInvoices: invoices.length,
      outstandingPayments,
      totalFreightThisMonth,
      outstandingSupplierPayments,
      unbilledCount: unbilledLrs.length,
    };
  }, [lorryReceipts, invoices, truckHiringNotes]);

  const recentLrs = useMemo(() => {
    return lorryReceipts.sort((a, b) => b.lrNumber - a.lrNumber).slice(0, 5);
  }, [lorryReceipts]);

  const recentInvoices = useMemo(() => {
    return invoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber).slice(0, 5);
  }, [invoices]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const unbilledLrIds = useMemo(() => {
    const invoicedLrIds = new Set(invoices.flatMap(inv => inv.lorryReceipts.map(lr => lr._id)));
    return lorryReceipts.filter(lr => !invoicedLrIds.has(lr._id)).map(lr => lr._id);
    }, [lorryReceipts, invoices]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Lorry Receipts" value={kpis.totalLrs} icon="📄" onClick={() => onViewChange({ name: 'LORRY_RECEIPTS' })} />
        <KpiCard title="Total Invoices" value={kpis.totalInvoices} icon="🧾" onClick={() => onViewChange({ name: 'INVOICES' })} />
        <KpiCard title="Total LRs Today" value={kpis.totalLrsToday} icon="🚚" onClick={() => onViewChange({ name: 'LORRY_RECEIPTS', filters: { startDate: todayStr, endDate: todayStr } })} />
        <KpiCard title="Unbilled LRs" value={kpis.unbilledCount} icon="📦" onClick={() => onViewChange({ name: 'LORRY_RECEIPTS', filters: { ids: unbilledLrIds } })} />
        <KpiCard title="Outstanding Payments" value={`₹${kpis.outstandingPayments.toLocaleString('en-IN')}`} icon="💰" onClick={() => onViewChange({ name: 'INVOICES', filters: { status: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] } })} />
        <KpiCard title="Total Freight This Month" value={`₹${kpis.totalFreightThisMonth.toLocaleString('en-IN')}`} icon="📊" onClick={() => onViewChange({ name: 'TRUCK_HIRING_NOTES', filters: { startDate: firstDayOfMonth, endDate: todayStr } })} />
        <KpiCard title="Outstanding Supplier Payments" value={`₹${kpis.outstandingSupplierPayments.toLocaleString('en-IN')}`} icon="💳" onClick={() => onViewChange({ name: 'TRUCK_HIRING_NOTES', filters: { showOnlyOutstanding: true } })} />
      </div>

      

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Recent Lorry Receipts</h3>
          <Button onClick={() => onViewChange({ name: 'LORRY_RECEIPTS' })} variant="link">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLrs.map(lr => (
                <tr key={lr._id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lr.lrNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lr.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lr.consignor?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lr.consignee?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{lr.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lr.status]}`}>
                       {lr.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_LR', id: lr._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View</button>
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
          <h3 className="text-xl font-semibold text-gray-800">Recent Invoices</h3>
          <Button onClick={() => onViewChange({ name: 'INVOICES' })} variant="link">View All</Button>
        </div>
         <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInvoices.map(inv => (
                <tr key={inv._id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.customer?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold text-right">₹{(inv.balanceDue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${invoiceStatusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_INVOICE', id: inv._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View</button>
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