import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
    {icon && <div className="text-3xl text-indigo-500">{icon}</div>}
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

interface DashboardSummaryProps {
  totalInvoices: number;
  totalLrs: number;
  totalOutstanding: number;
  lrsInTransit: number;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalInvoices,
  totalLrs,
  totalOutstanding,
  lrsInTransit,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard title="Total Invoices" value={totalInvoices} />
      <SummaryCard title="Total Lorry Receipts" value={totalLrs} />
      <SummaryCard title="Outstanding Amount" value={`₹${totalOutstanding.toLocaleString('en-IN')}`} />
      <SummaryCard title="LRs In Transit" value={lrsInTransit} />
    </div>
  );
};
