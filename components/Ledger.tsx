import React, { useState, useMemo } from 'react';
import type { Customer, Invoice, Payment } from '../types';
import { PaymentType, PaymentMode } from '../types';
import { formatDate, getCurrentDate } from '../services/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';
import { PaymentForm } from './PaymentForm';

interface LedgerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
}

export const Ledger: React.FC<LedgerProps> = ({ customers, invoices, payments, onSavePayment }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?._id || null);
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'invoice' | 'payment'>('all');

  const transactionData = useMemo(() => {
    if (!selectedCustomerId) return null;

    const customerInvoices = invoices
      .filter(inv => inv.customerId === selectedCustomerId)
      .map(inv => ({
        type: 'invoice' as const,
        date: inv.date,
        id: `inv-${inv._id}`,
        particulars: `Invoice No: ${inv.invoiceNumber} (LRs: ${(inv.lorryReceipts || []).map(lr => lr.lrNumber).join(', ')})`,
        debit: inv.grandTotal,
        credit: 0
    }));

    const customerPayments = payments
      .filter(p => p.customerId === selectedCustomerId)
      .map(p => {
        const invoiceNumber = invoices.find(inv => inv._id === p.invoiceId)?.invoiceNumber;
        const particulars = `Payment for INV-${invoiceNumber} via ${p.mode}${p.referenceNo ? ` (${p.referenceNo})` : ''}${p.notes ? ` - ${p.notes}` : ''}`;
        return {
          type: 'payment' as const,
          date: p.date,
          id: `pay-${p._id}`,
          particulars,
          debit: 0,
          credit: p.amount
        }
      });

    const allTransactions = [...customerInvoices, ...customerPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.type === 'invoice' ? -1 : 1));

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

    const endFilterDate = endDate ? new Date(endDate) : null; if(endFilterDate) endFilterDate.setHours(0,0,0,0);
    const relevantTransactionsForBalance = allTransactionsWithBalance.filter(tx => {
        const txDate = new Date(tx.date); txDate.setHours(0,0,0,0);
        return !endFilterDate || txDate <= endFilterDate;
    });
    const finalBalance = relevantTransactionsForBalance.length > 0 ? relevantTransactionsForBalance[relevantTransactionsForBalance.length - 1].balance : 0;

    return { transactions: filteredTransactions, totalDebit, totalCredit, finalBalance };
  }, [selectedCustomerId, invoices, payments, startDate, endDate, transactionType]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Client Ledger</h2>
      <Card>
        <Select label="Select Client" value={selectedCustomerId || ''} onChange={(e) => setSelectedCustomerId(e.target.value)}>
          <option value="" disabled>Select a client</option>
          {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
      </Card>
      
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

      {selectedCustomerId && transactionData ? (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
            <div className="mb-4">
                <Button onClick={() => setIsPaymentFormVisible(true)}>Add Payment Record</Button>
                {isPaymentFormVisible && (
                    <PaymentForm
                        invoices={invoices.filter(inv => inv.customerId === selectedCustomerId)}
                        customers={customers}
                        payments={payments}
                        onSave={async (p) => {
                            await onSavePayment(p as any); // TODO: Fix type
                            setIsPaymentFormVisible(false);
                        }}
                        onCancel={() => setIsPaymentFormVisible(false)}
                    />
                )}
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
      ) : (
        <Card><p className="text-gray-500">Please select a client to view their ledger.</p></Card>
      )}
    </div>
  );
};