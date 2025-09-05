import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LorryReceiptForm } from './components/LorryReceiptForm';
import { InvoiceForm } from './components/InvoiceForm';
import { LorryReceiptPDF } from './components/LorryReceiptPDF';
import { InvoicePDF } from './components/InvoicePDF';
import { Settings } from './components/Settings';
import { Ledger } from './components/Ledger';
import { Clients } from './components/Clients';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { hashPassword } from './services/authService';
import type { LorryReceipt, Invoice, Customer, Vehicle, CompanyInfo, Payment } from './types';
import { LorryReceiptStatus } from './types';
import { initialCustomers, initialVehicles, initialCompanyInfo } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockLorryReceipts, mockInvoices, mockPayments } from './mockData';

export type View = 
  | { name: 'DASHBOARD' }
  | { name: 'CREATE_LR' }
  | { name: 'EDIT_LR', id: number }
  | { name: 'VIEW_LR', id: number }
  | { name: 'CREATE_INVOICE' }
  | { name: 'CREATE_INVOICE_FROM_LR', lrId: number }
  | { name: 'EDIT_INVOICE', id: number }
  | { name: 'VIEW_INVOICE', id: number }
  | { name: 'SETTINGS' }
  | { name: 'CLIENTS' }
  | { name: 'LEDGER' };

const App: React.FC = () => {
  const [view, setView] = useState<View>({ name: 'DASHBOARD' });
  
  const [lorryReceipts, setLorryReceipts] = useLocalStorage<LorryReceipt[]>('lorryReceipts', mockLorryReceipts);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', mockInvoices);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', mockPayments);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('vehicles', initialVehicles);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', initialCompanyInfo);

  const [nextLrNumber, setNextLrNumber] = useLocalStorage<number>('nextLrNumber', (mockLorryReceipts.length > 0 ? Math.max(...mockLorryReceipts.map(lr => lr.id)) : 0) + 1);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useLocalStorage<number>('nextInvoiceNumber', (mockInvoices.length > 0 ? Math.max(...mockInvoices.map(i => i.id)) : 0) + 1);
  const [nextCustomerId, setNextCustomerId] = useLocalStorage<number>('nextCustomerId', (initialCustomers.length > 0 ? Math.max(...initialCustomers.map(c => c.id)) : 0) + 1);
  const [nextPaymentId, setNextPaymentId] = useLocalStorage<number>('nextPaymentId', (mockPayments.length > 0 ? Math.max(...mockPayments.map(p => p.id)) : 0) + 1);
  const [nextVehicleId, setNextVehicleId] = useLocalStorage<number>('nextVehicleId', (initialVehicles.length > 0 ? Math.max(...initialVehicles.map(v => v.id)) : 0) + 1);
    
  // Auth state
  const [passwordHash, setPasswordHash] = useLocalStorage<string | null>('app_password_hash', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSetPassword = async (password: string) => {
      const hash = await hashPassword(password);
      setPasswordHash(hash);
      setIsAuthenticated(true);
  };

  const handleLogin = async (password: string) => {
      if (!passwordHash) return;
      const inputHash = await hashPassword(password);
      if (inputHash === passwordHash) {
          setIsAuthenticated(true);
          setLoginError('');
      } else {
          setLoginError('Incorrect password. Please try again.');
          setIsAuthenticated(false);
      }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setView({ name: 'DASHBOARD' }); // Reset view on logout
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<{success: boolean, message: string}> => {
      if (!passwordHash) return { success: false, message: "No password set." };
      
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== passwordHash) {
          return { success: false, message: "Current password is not correct." };
      }
      
      const newHash = await hashPassword(newPassword);
      setPasswordHash(newHash);
      return { success: true, message: "Password updated successfully." };
  };

  const saveLorryReceipt = (lr: Omit<LorryReceipt, 'id' | 'status'> & { id?: number }) => {
    if (lr.id) {
      setLorryReceipts(prev => prev.map(l => l.id === lr.id ? { ...l, ...lr } : l));
    } else {
      const newLr: LorryReceipt = {
        ...lr,
        id: nextLrNumber,
        status: LorryReceiptStatus.CREATED,
      };
      setLorryReceipts(prev => [...prev, newLr]);
      setNextLrNumber(prev => prev + 1);
    }
    setView({ name: 'DASHBOARD' });
  };
  
  const saveCustomer = (customerData: Omit<Customer, 'id'> & { id?: number }): Customer => {
    if (customerData.id) {
      // Update existing customer
      const updatedCustomer = { ...customerData, id: customerData.id } as Customer;
      setCustomers(prev => prev.map(c => c.id === customerData.id ? updatedCustomer : c));
      return updatedCustomer;
    } else {
      // Create new customer
      const newCustomer: Customer = {
        ...customerData,
        id: nextCustomerId,
      };
      setCustomers(prev => [...prev, newCustomer]);
      setNextCustomerId(prev => prev + 1);
      return newCustomer;
    }
  };

  const deleteCustomer = (id: number) => {
    const isUsedInLr = lorryReceipts.some(lr => lr.consignorId === id || lr.consigneeId === id);
    const isUsedInInvoice = invoices.some(inv => inv.customerId === id);
    const isUsedInPayment = payments.some(p => p.customerId === id);

    if (isUsedInLr || isUsedInInvoice || isUsedInPayment) {
      alert('This client cannot be deleted because they are associated with existing lorry receipts, invoices, or payments. Please remove those records first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const saveVehicle = (vehicleData: Omit<Vehicle, 'id'>): Vehicle => {
    const newVehicle: Vehicle = {
        ...vehicleData,
        id: nextVehicleId,
    };
    setVehicles(prev => [...prev, newVehicle]);
    setNextVehicleId(prev => prev + 1);
    return newVehicle;
  };

  const saveInvoice = (invoice: Omit<Invoice, 'id'> & { id?: number }) => {
    if (invoice.id) {
      setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, ...invoice } : i));
    } else {
      const newInvoice: Invoice = {
        ...invoice,
        id: nextInvoiceNumber,
      };
      setInvoices(prev => [...prev, newInvoice]);
      setNextInvoiceNumber(prev => prev + 1);

      const invoicedLrIds = new Set(invoice.lorryReceipts.map(lr => lr.id));
      setLorryReceipts(prevLrs => prevLrs.map(lr => 
        invoicedLrIds.has(lr.id) ? { ...lr, status: LorryReceiptStatus.INVOICED } : lr
      ));
    }
    setView({ name: 'DASHBOARD' });
  };

  const savePayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
        ...payment,
        id: nextPaymentId,
    };
    setPayments(prev => [...prev, newPayment]);
    setNextPaymentId(prev => prev + 1);
  };
  
  const updateLrStatus = (id: number, status: LorryReceiptStatus) => {
      setLorryReceipts(prev => prev.map(lr => lr.id === id ? { ...lr, status } : lr));
  };
  
  const deleteLr = (id: number) => {
    if (window.confirm('Are you sure you want to delete this Lorry Receipt?')) {
      setLorryReceipts(prev => prev.filter(lr => lr.id !== id));
    }
  };

  const deleteInvoice = (id: number) => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };


  const renderContent = () => {
    switch (view.name) {
      case 'CREATE_LR':
        return <LorryReceiptForm 
                  onSave={saveLorryReceipt} 
                  onCancel={() => setView({ name: 'DASHBOARD' })} 
                  customers={customers}
                  vehicles={vehicles}
                  nextLrNumber={nextLrNumber}
                  onSaveCustomer={saveCustomer}
                  lorryReceipts={lorryReceipts}
                  onSaveVehicle={saveVehicle}
                />;
      case 'EDIT_LR':
        const lrToEdit = lorryReceipts.find(lr => lr.id === view.id);
        return lrToEdit ? <LorryReceiptForm 
                  onSave={saveLorryReceipt} 
                  onCancel={() => setView({ name: 'DASHBOARD' })} 
                  customers={customers}
                  vehicles={vehicles}
                  existingLr={lrToEdit}
                  nextLrNumber={lrToEdit.id}
                  onSaveCustomer={saveCustomer}
                  lorryReceipts={lorryReceipts}
                  onSaveVehicle={saveVehicle}
                /> : <div>LR not found</div>;
      case 'VIEW_LR':
        const lrToView = lorryReceipts.find(lr => lr.id === view.id);
        return lrToView ? <LorryReceiptPDF lorryReceipt={lrToView} companyInfo={companyInfo} customers={customers} vehicles={vehicles} /> : <div>LR not found</div>;
      
      case 'CREATE_INVOICE':
        const availableLrs = lorryReceipts.filter(lr => 
            lr.status === LorryReceiptStatus.CREATED ||
            lr.status === LorryReceiptStatus.IN_TRANSIT ||
            lr.status === LorryReceiptStatus.DELIVERED
        );
        return <InvoiceForm 
                  onSave={saveInvoice}
                  onCancel={() => setView({ name: 'DASHBOARD' })}
                  availableLrs={availableLrs}
                  customers={customers}
                  nextInvoiceNumber={nextInvoiceNumber}
                  companyInfo={companyInfo}
                />;
      case 'CREATE_INVOICE_FROM_LR':
        const lrToInvoice = lorryReceipts.find(lr => lr.id === view.lrId);
        if (!lrToInvoice) return <div>LR not found</div>;
        const availableLrsForNewInvoice = lorryReceipts.filter(lr => 
            lr.status === LorryReceiptStatus.CREATED ||
            lr.status === LorryReceiptStatus.IN_TRANSIT ||
            lr.status === LorryReceiptStatus.DELIVERED ||
            lr.id === view.lrId
        );
         return <InvoiceForm 
                  onSave={saveInvoice}
                  onCancel={() => setView({ name: 'DASHBOARD' })}
                  availableLrs={availableLrsForNewInvoice}
                  customers={customers}
                  nextInvoiceNumber={nextInvoiceNumber}
                  preselectedLr={lrToInvoice}
                  companyInfo={companyInfo}
                />;
      case 'EDIT_INVOICE':
         const invoiceToEdit = invoices.find(inv => inv.id === view.id);
         const lrsForEdit = lorryReceipts.filter(lr => 
            (lr.status !== LorryReceiptStatus.INVOICED && lr.status !== LorryReceiptStatus.PAID) || 
            invoiceToEdit?.lorryReceipts.some(ilr => ilr.id === lr.id)
          );
         return invoiceToEdit ? <InvoiceForm 
                   onSave={saveInvoice}
                   onCancel={() => setView({ name: 'DASHBOARD' })}
                   availableLrs={lrsForEdit}
                   customers={customers}
                   existingInvoice={invoiceToEdit}
                   nextInvoiceNumber={invoiceToEdit.id}
                   companyInfo={companyInfo}
                 /> : <div>Invoice not found</div>;
      case 'VIEW_INVOICE':
        const invoiceToView = invoices.find(inv => inv.id === view.id);
        return invoiceToView ? <InvoicePDF invoice={invoiceToView} companyInfo={companyInfo} customers={customers} /> : <div>Invoice not found</div>;
      
      case 'SETTINGS':
        return <Settings 
                  companyInfo={companyInfo} 
                  onSave={setCompanyInfo} 
                  lorryReceipts={lorryReceipts}
                  invoices={invoices}
                  payments={payments}
                  customers={customers}
                  vehicles={vehicles}
                  onPasswordChange={handleChangePassword}
                />;

      case 'LEDGER':
        return <Ledger customers={customers} invoices={invoices} payments={payments} onSavePayment={savePayment} />;
      
      case 'CLIENTS':
        return <Clients customers={customers} onSave={saveCustomer} onDelete={deleteCustomer} />;

      case 'DASHBOARD':
      default:
        return <Dashboard 
                 lorryReceipts={lorryReceipts} 
                 invoices={invoices}
                 customers={customers}
                 vehicles={vehicles}
                 companyInfo={companyInfo}
                 onViewChange={setView}
                 onUpdateLrStatus={updateLrStatus}
                 onDeleteLr={deleteLr}
                 onDeleteInvoice={deleteInvoice}
               />;
    }
  };

  if (!passwordHash) {
    return <Setup onSetPassword={handleSetPassword} />;
  }

  if (!isAuthenticated) {
      return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header view={view} onViewChange={setView} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
