import React, { useMemo } from 'react';
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';
import { formatDate } from '../services/utils';
import { Card } from './ui/Card';

interface PendingPaymentsProps {
  invoices: Invoice[];
}

export const PendingPayments: React.FC<PendingPaymentsProps> = ({ invoices }) => {
  const pendingInvoices = useMemo(() => {
    return invoices
      .filter(inv => inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID)
      .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
  }, [invoices]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Pending Payments</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingInvoices.map(invoice => (
                <tr key={invoice._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`INV-${invoice.invoiceNumber}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(invoice.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</td>
                  <td className="px-6 py-4 text-right text-sm">₹{invoice.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === InvoiceStatus.UNPAID ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pendingInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No pending payments.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
