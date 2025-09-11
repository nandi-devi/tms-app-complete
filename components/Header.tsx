import React, { useState } from 'react';
import type { View } from '../App';

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, onViewChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClasses = "bg-indigo-100 text-indigo-700 font-semibold";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900";

  const getButtonClass = (targetViewNames: View['name'][]) => {
    const isActive = targetViewNames.includes(view.name);
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const NavButtons = () => (
    <>
      <button
        onClick={() => onViewChange({ name: 'DASHBOARD' })}
        className={getButtonClass(['DASHBOARD'])}
      >
        Dashboard
      </button>
      <button
        onClick={() => onViewChange({ name: 'LORRY_RECEIPTS' })}
        className={getButtonClass(['LORRY_RECEIPTS'])}
      >
        Lorry Receipts
      </button>
      <button
        onClick={() => onViewChange({ name: 'INVOICES' })}
        className={getButtonClass(['INVOICES'])}
      >
        Invoice
      </button>
      <button
        onClick={() => onViewChange({ name: 'PENDING_PAYMENTS' })}
        className={getButtonClass(['PENDING_PAYMENTS'])}
      >
        Pending Payments
      </button>
      <button
        onClick={() => onViewChange({ name: 'LEDGER' })}
        className={getButtonClass(['LEDGER'])}
      >
        Ledger
      </button>
      <button
        onClick={() => onViewChange({ name: 'CLIENTS' })}
        className={getButtonClass(['CLIENTS'])}
      >
        Clients
      </button>
      <button
        onClick={() => onViewChange({ name: 'TRUCK_HIRING_NOTES' })}
        className={getButtonClass(['TRUCK_HIRING_NOTES'])}
      >
        Truck Hiring
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
    </>
  );

  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => onViewChange({ name: 'DASHBOARD' })}
            >
              <div className="bg-indigo-600 text-white font-bold text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-md">
                A
              </div>
              <h1 className="ml-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                ALL INDIA LOGISTICS CHENNAI
              </h1>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavButtons />
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center" onClick={() => { onViewChange({ name: 'DASHBOARD' }); setIsMobileMenuOpen(false); }}>
                <div className="bg-indigo-600 text-white font-bold text-xl w-9 h-9 rounded-lg flex items-center justify-center shadow-md">A</div>
                <span className="ml-2 font-semibold text-gray-800">AILC</span>
              </div>
              <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto">
              {[
                { label: 'Dashboard', target: 'DASHBOARD' },
                { label: 'Lorry Receipts', target: 'LORRY_RECEIPTS' },
                { label: 'Invoice', target: 'INVOICES' },
                { label: 'Pending Payments', target: 'PENDING_PAYMENTS' },
                { label: 'Ledger', target: 'LEDGER' },
                { label: 'Clients', target: 'CLIENTS' },
                { label: 'Truck Hiring', target: 'TRUCK_HIRING_NOTES' },
                { label: 'Settings', target: 'SETTINGS' },
              ].map(item => (
                <button
                  key={item.target}
                  className={`${getButtonClass([item.target as View['name']])} w-full text-left`}
                  onClick={() => { onViewChange({ name: item.target as View['name'] }); setIsMobileMenuOpen(false); }}
                >
                  {item.label}
                </button>
              ))}
              <button className="w-full text-left ${inactiveClasses} px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50" onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
