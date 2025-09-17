import React, { useState, useMemo } from 'react';
import type { Customer, Invoice, Payment, TruckHiringNote } from '../types';
import { formatDate } from '../services/utils';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { exportToCsv } from '../services/exportService';
import type { View } from '../App';

interface ClientLedgerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  onViewChange: (view: View) => void;
}

export const ClientLedger: React.FC<ClientLedgerProps> = ({ customers, invoices, payments, truckHiringNotes, onViewChange }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'invoice' | 'payment'>('all');

  const transactionData = useMemo(() => {
    if (!selectedCustomerId) return null;

    const customerInvoices = invoices
      .filter(inv => inv.customer?._id === selectedCustomerId)
      .map(inv => ({
        type: 'invoice' as const,
        date: inv.date,
        id: `inv-${inv._id}`,
        particulars: `Invoice No: ${inv.invoiceNumber}`,
        debit: inv.grandTotal,
        credit: 0
    }));

    const customerPayments = payments
      .filter(p => {
        // Check if payment is for an invoice belonging to this customer
        const isInvoicePayment = p.invoiceId && 
          (typeof p.invoiceId === 'string' ? 
            invoices.find(inv => inv._id === p.invoiceId)?.customer?._id === selectedCustomerId :
            p.invoiceId.customer?._id === selectedCustomerId);
        
        // Check if payment is for a THN belonging to this customer (using agency name as customer identifier)
        const isThnPayment = p.truckHiringNoteId && 
          (typeof p.truckHiringNoteId === 'string' ?
            truckHiringNotes.find(thn => thn._id === p.truckHiringNoteId)?.agencyName === customers.find(c => c._id === selectedCustomerId)?.name :
            p.truckHiringNoteId.agencyName === customers.find(c => c._id === selectedCustomerId)?.name);
        
        return isInvoicePayment || isThnPayment;
      })
      .map(p => {
        let particulars = '';
        if (p.invoiceId) {
          const invoiceNumber = typeof p.invoiceId === 'string' ? 
            invoices.find(inv => inv._id === p.invoiceId)?.invoiceNumber :
            p.invoiceId.invoiceNumber;
          particulars = `Payment for INV-${invoiceNumber} via ${p.mode}`;
        } else if (p.truckHiringNoteId) {
          const thnNumber = typeof p.truckHiringNoteId === 'string' ?
            truckHiringNotes.find(thn => thn._id === p.truckHiringNoteId)?.thnNumber :
            p.truckHiringNoteId.thnNumber;
          particulars = `Payment for THN-${thnNumber} via ${p.mode}`;
        }
        
        return {
          type: 'payment' as const,
          date: p.date,
          id: `pay-${p._id}`,
          particulars,
          debit: 0,
          credit: p.amount
        };
      });

    const allTransactions = [...customerInvoices, ...customerPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const allTransactionsWithBalance = allTransactions.map(tx => {
        runningBalance += (tx.debit - tx.credit);
        return { ...tx, balance: runningBalance };
    });

    const filteredTransactions = allTransactionsWithBalance.filter(tx => {
        const txDate = new Date(tx.date); txDate.setHours(0,0,0,0);
        const start = startDate ? new Date(startDate) : null; if(start) start.setHours(0,0,0,0);
        const end = endDate ? new Date(endDate) : null; if(end) end.setHours(0,0,0,0);
        const matchesDate = (!start || txDate >= start) && (!end || txDate <= end);
        const matchesType = transactionType === 'all' || tx.type === transactionType;
        return matchesDate && matchesType;
    });

    const totalDebit = filteredTransactions.reduce((sum, tx) => sum + tx.debit, 0);
    const totalCredit = filteredTransactions.reduce((sum, tx) => sum + tx.credit, 0);
    const finalBalance = allTransactionsWithBalance.length > 0 ? allTransactionsWithBalance[allTransactionsWithBalance.length - 1].balance : 0;

    return { transactions: filteredTransactions, totalDebit, totalCredit, finalBalance };
  }, [selectedCustomerId, invoices, payments, truckHiringNotes, customers, startDate, endDate, transactionType]);

  const handleExport = () => {
    if (!transactionData || !selectedCustomerId) return;
    const customer = customers.find(c => c._id === selectedCustomerId);
    const filename = `Client-Ledger-${customer?.name.replace(/\s+/g, '_') || 'export'}.csv`;
    const dataToExport = transactionData.transactions.map(tx => ({
        Date: formatDate(tx.date),
        Particulars: tx.particulars,
        Debit: tx.debit,
        Credit: tx.credit,
        Balance: `${Math.abs(tx.balance).toFixed(2)} ${tx.balance >= 0 ? 'Dr' : 'Cr'}`
    }));
    exportToCsv(filename, dataToExport);
  };

  return (
    <div className="space-y-6">
      {customers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Clients Found</h3>
            <p className="text-gray-500 mb-6">You need to add a client before you can view a client ledger.</p>
            <Button onClick={() => onViewChange({ name: 'CLIENTS' })}>
              Add New Client
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <Select label="Select Client" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              <option value="" disabled>-- Select a Client --</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </Card>

          {selectedCustomerId && (
            <>
              <Card title="Filters">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <Select label="Transaction Type" value={transactionType} onChange={e => setTransactionType(e.target.value as any)}>
                        <option value="all">All Transactions</option>
                        <option value="invoice">Invoices (Debit)</option>
                        <option value="payment">Payments (Credit)</option>
                    </Select>
                </div>
              </Card>

              {transactionData && (
                <>
                  <div className="flex justify-end space-x-2">
                      <Button onClick={() => onViewChange({ name: 'VIEW_CLIENT_LEDGER_PDF', customerId: selectedCustomerId })} variant="secondary">Export to PDF</Button>
                      <Button onClick={handleExport} variant="secondary">Export to CSV</Button>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4">
                      <div>
                          <h4 className="text-sm font-medium text-gray-600">Total Billed (Debit)</h4>
                          <p className="text-2xl font-bold text-red-600">₹{transactionData.totalDebit.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                          <h4 className="text-sm font-medium text-gray-600">Total Paid (Credit)</h4>
                          <p className="text-2xl font-bold text-green-600">₹{transactionData.totalCredit.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                          <h4 className="text-sm font-medium text-gray-600">Closing Balance</h4>
                          <p className={`text-2xl font-bold ${transactionData.finalBalance >= 0 ? 'text-indigo-900' : 'text-green-800'}`}>₹{Math.abs(transactionData.finalBalance).toLocaleString('en-IN')} {transactionData.finalBalance >= 0 ? 'Dr' : 'Cr'}</p>
                      </div>
                  </div>
                  <Card>
                      <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-slate-100">
                                  <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance (₹)</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                  {transactionData.transactions.map(tx => (
                                      <tr key={tx.id} className="hover:bg-slate-50">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(tx.date)}</td>
                                          <td className="px-6 py-4 text-sm">{tx.particulars}</td>
                                          <td className="px-6 py-4 text-right text-sm text-red-700">{tx.debit > 0 ? tx.debit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</td>
                                          <td className="px-6 py-4 text-right text-sm text-green-700">{tx.credit > 0 ? tx.credit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</td>
                                          <td className="px-6 py-4 text-right font-semibold text-sm">
                                              {Math.abs(tx.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})} {tx.balance >= 0 ? 'Dr' : 'Cr'}
                                          </td>
                                      </tr>
                                  ))}
                                  {transactionData.transactions.length === 0 && (
                                      <tr>
                                          <td colSpan={5} className="text-center py-8 text-gray-500">No transactions found for the selected criteria.</td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </Card>
                </>
              )}
            </>
          )}

          {!selectedCustomerId && customers.length > 0 && (
            <Card><p className="text-center text-gray-500 py-12">Please select a client to view their ledger.</p></Card>
          )}
        </>
      )}
    </div>
  );
};
