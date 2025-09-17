import React, { useState, useEffect } from 'react';
import type { View } from '../App';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  target: View;
  badge?: number;
  isActive?: (view: View) => boolean;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    target: { name: 'DASHBOARD' },
    isActive: (view) => view.name === 'DASHBOARD'
  },
  {
    id: 'lorry-receipts',
    label: 'Lorry Receipts',
    icon: '📄',
    target: { name: 'LORRY_RECEIPTS' },
    isActive: (view) => ['LORRY_RECEIPTS', 'CREATE_LR', 'EDIT_LR', 'VIEW_LR'].includes(view.name)
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: '🧾',
    target: { name: 'INVOICES' },
    isActive: (view) => ['INVOICES', 'CREATE_INVOICE', 'EDIT_INVOICE', 'VIEW_INVOICE', 'CREATE_INVOICE_FROM_LR'].includes(view.name)
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: '💰',
    target: { name: 'PENDING_PAYMENTS' },
    isActive: (view) => view.name === 'PENDING_PAYMENTS'
  },
  {
    id: 'ledger',
    label: 'Ledger',
    icon: '📊',
    target: { name: 'LEDGER' },
    isActive: (view) => ['LEDGER', 'VIEW_CLIENT_LEDGER_PDF', 'VIEW_COMPANY_LEDGER_PDF'].includes(view.name)
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: '👥',
    target: { name: 'CLIENTS' },
    isActive: (view) => view.name === 'CLIENTS'
  },
  {
    id: 'truck-hiring',
    label: 'Truck Hiring',
    icon: '🚛',
    target: { name: 'TRUCK_HIRING_NOTES' },
    isActive: (view) => ['TRUCK_HIRING_NOTES', 'VIEW_THN'].includes(view.name)
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    target: { name: 'SETTINGS' },
    isActive: (view) => view.name === 'SETTINGS'
  },
  {
    id: 'input-test',
    label: 'Input Test',
    icon: '🧪',
    target: { name: 'INPUT_TEST' },
    isActive: (view) => view.name === 'INPUT_TEST'
  }
];

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange, 
  onLogout, 
  isAuthenticated 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (item: NavItem) => {
    onViewChange(item.target);
  };

  const NavItemComponent: React.FC<{ item: NavItem; isMobile?: boolean }> = ({ item, isMobile = false }) => {
    const isActive = item.isActive ? item.isActive(currentView) : false;
    
    return (
      <button
        onClick={() => handleNavClick(item)}
        className={`
          group flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
          ${isMobile ? 'justify-start' : 'justify-center flex-col min-h-[60px]'}
          ${isActive 
            ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isMobile ? 'mb-1' : ''}
        `}
        title={item.label}
      >
        <span className={`text-lg ${isMobile ? 'mr-3' : 'mb-1'}`}>
          {item.icon}
        </span>
        <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium`}>
          {item.label}
        </span>
        {item.badge && item.badge > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center cursor-pointer group" onClick={() => onViewChange({ name: 'DASHBOARD' })}>
            <div className="bg-indigo-600 text-white font-bold text-xl w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-lg">
              A
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                AILC
              </h1>
              <p className="text-xs text-gray-500">Transport Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavItemComponent key={item.id} item={item} />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <span className="text-lg mr-3">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`
        lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 transition-all duration-200 safe-area-inset-top
        ${isScrolled ? 'shadow-lg' : 'shadow-sm'}
      `}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onViewChange({ name: 'DASHBOARD' })}>
            <div className="bg-indigo-600 text-white font-bold text-lg w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-md">
              A
            </div>
            <div className="ml-2">
              <h1 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                AILC
              </h1>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-indigo-600 text-white font-bold text-lg w-8 h-8 rounded-lg flex items-center justify-center shadow-md">A</div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-gray-800">AILC</h1>
                  <p className="text-xs text-gray-500">Transport Management</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <NavItemComponent key={item.id} item={item} isMobile />
              ))}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <span className="text-lg mr-3">🚪</span>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = item.isActive ? item.isActive(currentView) : false;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`
                  flex flex-col items-center justify-center px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-indigo-700 bg-indigo-50' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
