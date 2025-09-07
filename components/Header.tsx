import React from 'react';
import type { View } from '../App';

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, onViewChange, onLogout }) => {
  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClasses = "bg-indigo-100 text-indigo-700 font-semibold";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900";
  
  const getButtonClass = (targetViewNames: View['name'][]) => {
    const isActive = targetViewNames.includes(view.name);
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="bg-slate-50/80 backdrop-blur-lg shadow-sm sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => onViewChange({ name: 'DASHBOARD' })}
            >
                <div className="bg-red-600 text-white font-bold text-4xl w-12 h-12 flex items-center justify-center transform -skew-x-12 transition-transform duration-300 group-hover:scale-110 shadow-md">
                    A
                </div>
                <h1 className="ml-3 text-2xl font-bold text-gray-800 tracking-wide group-hover:text-indigo-600 transition-colors">ALL INDIA LOGISTICS CHENNAI</h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onViewChange({ name: 'DASHBOARD' })}
              className={getButtonClass(['DASHBOARD'])}
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange({ name: 'CREATE_LR' })}
              className={getButtonClass(['CREATE_LR'])}
            >
              New Lorry Receipt
            </button>
            <button
              onClick={() => onViewChange({ name: 'CREATE_INVOICE' })}
              className={getButtonClass(['CREATE_INVOICE', 'CREATE_INVOICE_FROM_LR'])}
            >
              New Invoice
            </button>
             <button
              onClick={() => onViewChange({ name: 'LEDGER' })}
              className={getButtonClass(['LEDGER'])}
            >
              Ledger
            </button>
            <button
              onClick={() => onViewChange({ name: 'PENDING_PAYMENTS' })}
              className={getButtonClass(['PENDING_PAYMENTS'])}
            >
              Pending Payments
            </button>
            <button
              onClick={() => onViewChange({ name: 'CLIENTS' })}
              className={getButtonClass(['CLIENTS'])}
            >
              Clients
            </button>
            <button
              onClick={() => onViewChange({ name: 'SUPPLIERS' })}
              className={getButtonClass(['SUPPLIERS'])}
            >
              Suppliers
            </button>
             <button
              onClick={() => onViewChange({ name: 'SETTINGS' })}
              className={getButtonClass(['SETTINGS'])}
            >
              Settings
            </button>
            <button
              onClick={onLogout}
              className="text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
