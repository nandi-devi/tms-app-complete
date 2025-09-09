import React, { useState } from 'react';
import type { Customer, Invoice, Payment, TruckHiringNote } from '../types';
import { ClientLedger } from './ClientLedger';
import { CompanyLedger } from './CompanyLedger';
import { Card } from './ui/Card';

import type { View } from '../App';

interface LedgerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  onViewChange: (view: View) => void;
}

type LedgerView = 'client' | 'company';

export const Ledger: React.FC<LedgerProps> = (props) => {
  const [view, setView] = useState<LedgerView>('client');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Ledger</h2>
      
      <Card>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-lg font-medium ${view === 'client' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('client')}
          >
            Client Ledger
          </button>
          <button
            className={`px-4 py-2 text-lg font-medium ${view === 'company' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('company')}
          >
            Company Ledger
          </button>
        </div>
      </Card>

      {view === 'client' ? <ClientLedger {...props} /> : <CompanyLedger {...props} />}
    </div>
  );
};
