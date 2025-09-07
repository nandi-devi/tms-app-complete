import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, Payment, PaymentMode, PaymentType, Customer } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';
import { getCurrentDate } from '../services/utils';

interface PaymentFormProps {
  invoices: Invoice[];
  customers: Customer[];
  payments: Payment[];
  onSave: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ invoices, customers, payments, onSave, onCancel }) => {
  const [paymentType, setPaymentType] = useState<'invoice' | 'on-account'>('invoice');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(getCurrentDate());
  const [mode, setMode] = useState<PaymentMode>(PaymentMode.CASH);
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid');
  const selectedInvoice = invoices.find(inv => inv._id === selectedInvoiceId);

  const outstandingAmount = useMemo(() => {
    if (!selectedInvoice) return 0;
    const paidAmount = payments
      .filter(p => p.invoiceId === selectedInvoice._id)
      .reduce((sum, p) => sum + p.amount, 0);
    return selectedInvoice.grandTotal - paidAmount;
  }, [selectedInvoice, payments]);

  useEffect(() => {
    if (paymentType === 'invoice' && selectedInvoice) {
      setAmount(outstandingAmount);
    } else {
      setAmount(0);
    }
  }, [paymentType, selectedInvoice, outstandingAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    let paymentData: Omit<Payment, '_id' | 'customer' | 'invoice'>;

    if (paymentType === 'invoice') {
      if (!selectedInvoiceId) {
        alert('Please select an invoice.');
        return;
      }
      paymentData = {
        invoiceId: selectedInvoiceId,
        customerId: selectedInvoice!.customer!._id,
        amount,
        date,
        mode,
        referenceNo,
        notes,
        type: PaymentType.RECEIPT,
      };
    } else {
      if (!selectedCustomerId) {
        alert('Please select a customer.');
        return;
      }
      paymentData = {
        invoiceId: undefined,
        customerId: selectedCustomerId,
        amount,
        date,
        mode,
        referenceNo,
        notes,
        type: PaymentType.RECEIPT,
      };
    }

    await onSave(paymentData);
    onCancel();
  };

  return (
    <Card title="Record a Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <label>
            <input type="radio" value="invoice" checked={paymentType === 'invoice'} onChange={() => setPaymentType('invoice')} />
            <span className="ml-2">Against Invoice</span>
          </label>
          <label>
            <input type="radio" value="on-account" checked={paymentType === 'on-account'} onChange={() => setPaymentType('on-account')} />
            <span className="ml-2">On-Account</span>
          </label>
        </div>

        {paymentType === 'invoice' ? (
          <>
            <Select
              label="Select Invoice"
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              required
            >
              <option value="" disabled>Select an unpaid invoice</option>
              {unpaidInvoices.map(inv => (
                <option key={inv._id} value={inv._id}>
                  {`INV-${inv.invoiceNumber}`} ({inv.customer?.name}) - ₹{inv.grandTotal.toLocaleString()}
                </option>
              ))}
            </Select>
            {selectedInvoice && (
              <div className="p-4 bg-slate-100 rounded-lg text-sm">
                <p><strong>Client:</strong> {selectedInvoice.customer?.name}</p>
                <p><strong>Invoice Total:</strong> ₹{selectedInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p className="font-bold"><strong>Outstanding:</strong> ₹{outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
          </>
        ) : (
          <Select
            label="Select Customer"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            required
          >
            <option value="" disabled>Select a customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Payment Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <Input label="Amount" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} required onFocus={e => e.target.select()} />
          <Select label="Payment Mode" value={mode} onChange={e => setMode(e.target.value as PaymentMode)} required>
            {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Input label="Reference No." value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="Cheque No, Txn ID..." />
          <Input wrapperClassName="md:col-span-2" label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Payment</Button>
        </div>
      </form>
    </Card>
  );
};
