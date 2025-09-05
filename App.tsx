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
import { initialCompanyInfo } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockLorryReceipts, mockInvoices, mockPayments } from './mockData';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer as deleteCustomerService } from './services/customerService';
import { getVehicles, createVehicle } from './services/vehicleService';
import { getLorryReceipts, createLorryReceipt, updateLorryReceipt, deleteLorryReceipt } from './services/lorryReceiptService';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice as deleteInvoiceService } from './services/invoiceService';
import { getPayments, createPayment } from './services/paymentService';

export type View = 
  | { name: 'DASHBOARD' }
  | { name: 'CREATE_LR' }
  | { name: 'EDIT_LR', id: string }
  | { name: 'VIEW_LR', id: string }
  | { name: 'CREATE_INVOICE' }
  | { name: 'CREATE_INVOICE_FROM_LR', lrId: string }
  | { name: 'EDIT_INVOICE', id: string }
  | { name: 'VIEW_INVOICE', id: string }
  | { name: 'SETTINGS' }
  | { name: 'CLIENTS' }
  | { name: 'LEDGER' };

const App: React.FC = () => {
  const [view, setView] = useState<View>({ name: 'DASHBOARD' });
  
  const [lorryReceipts, setLorryReceipts] = useState<LorryReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', initialCompanyInfo);

  const [nextLrNumber, setNextLrNumber] = useState(0);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(0);
    
  // Auth state
  const [passwordHash, setPasswordHash] = useLocalStorage<string | null>('app_password_hash', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedCustomers, fetchedVehicles, fetchedLorryReceipts, fetchedInvoices, fetchedPayments] = await Promise.all([
          getCustomers(),
          getVehicles(),
          getLorryReceipts(),
          getInvoices(),
          getPayments(),
        ]);
        setCustomers(fetchedCustomers);
        setVehicles(fetchedVehicles);
        setLorryReceipts(fetchedLorryReceipts);
        setInvoices(fetchedInvoices);
        setPayments(fetchedPayments);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        // Optionally, show an error message to the user
      }
    };
    fetchInitialData();
  }, []);

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

  const saveLorryReceipt = async (lr: Omit<LorryReceipt, 'id' | '_id' | 'status'> & { _id?: string }) => {
    try {
      if (lr._id) {
        const updatedLr = await updateLorryReceipt(lr._id, lr);
        setLorryReceipts(prev => prev.map(l => l._id === updatedLr._id ? updatedLr : l));
      } else {
        const newLrData = {
          ...lr,
          status: LorryReceiptStatus.CREATED,
        };
        const newLr = await createLorryReceipt(newLrData);
        setLorryReceipts(prev => [...prev, newLr]);
      }
      setView({ name: 'DASHBOARD' });
    } catch (error) {
      console.error('Failed to save lorry receipt:', error);
      // Handle error appropriately
    }
  };
  
  const saveCustomer = async (customerData: Omit<Customer, 'id' | '_id'> & { _id?: string }): Promise<Customer> => {
    try {
      if (customerData._id) {
        // Update existing customer
        const updated = await updateCustomer(customerData._id, customerData);
        setCustomers(prev => prev.map(c => c._id === updated._id ? updated : c));
        return updated;
      } else {
        // Create new customer
        const newCustomer = await createCustomer(customerData);
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
      // Optionally, show an error to the user
      throw error; // Re-throw to be handled by the form
    }
  };

  const deleteCustomer = async (id: string) => {
    // TODO: Re-implement this check with server-side logic if necessary.
    // For now, we assume the backend will handle deletion constraints.
    // const isUsedInLr = lorryReceipts.some(lr => lr.consignorId === id || lr.consigneeId === id);
    // const isUsedInInvoice = invoices.some(inv => inv.customerId === id);
    // const isUsedInPayment = payments.some(p => p.customerId === id);

    // if (isUsedInLr || isUsedInInvoice || isUsedInPayment) {
    //   alert('This client cannot be deleted because they are associated with existing lorry receipts, invoices, or payments. Please remove those records first.');
    //   return;
    // }
    
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteCustomerService(id);
        setCustomers(prev => prev.filter(c => c._id !== id));
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete client. It might be in use.');
      }
    }
  };

  const saveVehicle = async (vehicleData: Omit<Vehicle, 'id' | '_id'>): Promise<Vehicle> => {
    try {
      const newVehicle = await createVehicle(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      throw error;
    }
  };

  const saveInvoice = async (invoice: Omit<Invoice, 'id' | '_id'> & { _id?: string }) => {
    try {
      let savedInvoice;
      if (invoice._id) {
        savedInvoice = await updateInvoice(invoice._id, invoice);
        setInvoices(prev => prev.map(i => i._id === savedInvoice._id ? savedInvoice : i));
      } else {
        savedInvoice = await createInvoice(invoice);
        setInvoices(prev => [...prev, savedInvoice]);
      }

      const invoicedLrIds = new Set(savedInvoice.lorryReceipts.map(lr => lr._id));
      const updatedLrs = lorryReceipts.map(lr =>
        invoicedLrIds.has(lr._id) ? { ...lr, status: LorryReceiptStatus.INVOICED } : lr
      );
      setLorryReceipts(updatedLrs);

      // Also update status on the backend for each LR
      for (const lrId of invoicedLrIds) {
        await updateLorryReceipt(lrId, { status: LorryReceiptStatus.INVOICED });
      }

      setView({ name: 'DASHBOARD' });
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  };

  const savePayment = async (payment: Omit<Payment, 'id' | '_id'>) => {
    try {
      const newPayment = await createPayment(payment);
      setPayments(prev => [...prev, newPayment]);
    } catch (error) {
      console.error('Failed to save payment:', error);
    }
  };
  
  const updateLrStatus = async (id: string, status: LorryReceiptStatus) => {
    try {
        const lrToUpdate = lorryReceipts.find(lr => lr._id === id);
        if (lrToUpdate) {
            const updatedLr = await updateLorryReceipt(id, { ...lrToUpdate, status });
            setLorryReceipts(prev => prev.map(lr => lr._id === id ? updatedLr : lr));
        }
    } catch (error) {
        console.error('Failed to update LR status:', error);
    }
  };
  
  const deleteLr = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Lorry Receipt?')) {
      try {
        await deleteLorryReceipt(id);
        setLorryReceipts(prev => prev.filter(lr => lr._id !== id));
      } catch (error) {
        console.error('Failed to delete lorry receipt:', error);
        alert('Failed to delete lorry receipt. It might be in use in an invoice.');
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      try {
        await deleteInvoiceService(id);
        setInvoices(prev => prev.filter(i => i._id !== id));
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        alert('Failed to delete invoice.');
      }
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
        const lrToEdit = lorryReceipts.find(lr => lr._id === view.id);
        return lrToEdit ? <LorryReceiptForm 
                  onSave={saveLorryReceipt} 
                  onCancel={() => setView({ name: 'DASHBOARD' })} 
                  customers={customers}
                  vehicles={vehicles}
                  existingLr={lrToEdit}
                  nextLrNumber={0} // Not used anymore
                  onSaveCustomer={saveCustomer}
                  lorryReceipts={lorryReceipts}
                  onSaveVehicle={saveVehicle}
                /> : <div>LR not found</div>;
      case 'VIEW_LR':
        const lrToView = lorryReceipts.find(lr => lr._id === view.id);
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
        const lrToInvoice = lorryReceipts.find(lr => lr._id === view.lrId);
        if (!lrToInvoice) return <div>LR not found</div>;
        const availableLrsForNewInvoice = lorryReceipts.filter(lr => 
            lr.status === LorryReceiptStatus.CREATED ||
            lr.status === LorryReceiptStatus.IN_TRANSIT ||
            lr.status === LorryReceiptStatus.DELIVERED ||
            lr._id === view.lrId
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
         const invoiceToEdit = invoices.find(inv => inv._id === view.id);
         const lrsForEdit = lorryReceipts.filter(lr => 
            (lr.status !== LorryReceiptStatus.INVOICED && lr.status !== LorryReceiptStatus.PAID) || 
            invoiceToEdit?.lorryReceipts.some(ilr => ilr._id === lr._id)
          );
         return invoiceToEdit ? <InvoiceForm 
                   onSave={saveInvoice}
                   onCancel={() => setView({ name: 'DASHBOARD' })}
                   availableLrs={lrsForEdit}
                   customers={customers}
                   existingInvoice={invoiceToEdit}
                   nextInvoiceNumber={0}
                   companyInfo={companyInfo}
                 /> : <div>Invoice not found</div>;
      case 'VIEW_INVOICE':
        const invoiceToView = invoices.find(inv => inv._id === view.id);
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
