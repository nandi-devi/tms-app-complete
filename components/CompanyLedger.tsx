import React, { useState, useMemo } from 'react';
import type { Invoice, Payment, TruckHiringNote } from '../types';
import { formatDate } from '../services/utils';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { exportToCsv } from '../services/exportService';
import type { View } from '../App';

interface CompanyLedgerProps {
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  onViewChange: (view: View) => void;
}

export const CompanyLedger: React.FC<CompanyLedgerProps> = ({ invoices, payments, truckHiringNotes, onViewChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');

  const transactionData = useMemo(() => {
    const invoiceIncome = invoices.map(inv => ({
      type: 'income' as const,
      date: inv.date,
      id: `inv-${inv._id}`,
      particulars: `Invoice No: ${inv.invoiceNumber} to ${inv.customer?.name}`,
      amount: inv.grandTotal,
    }));

    const thnExpenses = truckHiringNotes.map(thn => ({
        type: 'expense' as const,
        date: thn.date,
        id: `thn-${thn._id}`,
        particulars: `THN No: ${thn.thnNumber} to ${thn.truckOwnerName}`,
        amount: thn.freight,
    }));

    // Note: We are considering all payments as cash flow, not separate income/expense
    // This provides a simpler cash-flow view.

    const allTransactions = [...invoiceIncome, ...thnExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.date); txDate.setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate) : null; if (start) start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : null; if (end) end.setHours(0, 0, 0, 0);
      const matchesDate = (!start || txDate >= start) && (!end || txDate <= end);
      const matchesType = transactionType === 'all' || tx.type === transactionType;
      return matchesDate && matchesType;
    });

    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const net = totalIncome - totalExpense;

    return { transactions: filteredTransactions, totalIncome, totalExpense, net };
  }, [invoices, truckHiringNotes, startDate, endDate, transactionType]);

  const handleExport = () => {
    if (!transactionData) return;
    const filename = `Company-Ledger.csv`;
    const dataToExport = transactionData.transactions.map(tx => ({
        Date: formatDate(tx.date),
        Type: tx.type,
        Particulars: tx.particulars,
        Amount: tx.amount,
    }));
    exportToCsv(filename, dataToExport);
  };

  return (
    <div className="space-y-6">
      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Select label="Transaction Type" value={transactionType} onChange={e => setTransactionType(e.target.value as any)}>
            <option value="all">All Transactions</option>
            <option value="income">Income (Invoices)</option>
            <option value="expense">Expenses (THNs)</option>
          </Select>
        </div>
      </Card>

      {transactionData.transactions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transactions Found</h3>
            <p className="text-gray-500">There are no company transactions (invoices or truck hiring notes) recorded yet.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex justify-end space-x-2">
              <Button onClick={() => onViewChange({ name: 'VIEW_COMPANY_LEDGER_PDF' })} variant="secondary">Export to PDF</Button>
              <Button onClick={handleExport} variant="secondary">Export to CSV</Button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Income</h4>
              <p className="text-2xl font-bold text-green-600">₹{transactionData.totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Expenses</h4>
              <p className="text-2xl font-bold text-red-600">₹{transactionData.totalExpense.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Net Profit / Loss</h4>
              <p className={`text-2xl font-bold ${transactionData.net >= 0 ? 'text-indigo-900' : 'text-orange-600'}`}>
                ₹{Math.abs(transactionData.net).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionData.transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{tx.particulars}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
