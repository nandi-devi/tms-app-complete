import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LorryReceiptForm } from './components/LorryReceiptForm';
import { InvoiceForm } from './components/InvoiceForm';
import { LorryReceiptPDF } from './components/LorryReceiptPDF';
import { InvoicePDF } from './components/InvoicePDF';
import { Settings } from './components/Settings';
import { Ledger } from './components/Ledger';
import { PendingPayments } from './components/PendingPayments';
import { Clients } from './components/Clients';
import { TruckHiringNotes } from './components/TruckHiringNotes';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { hashPassword } from './services/authService';
import type { LorryReceipt, Invoice, Customer, Vehicle, CompanyInfo, Payment } from './types';
import { LorryReceiptStatus } from './types';
import { initialCompanyInfo } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer as deleteCustomerService } from './services/customerService';
import { getVehicles, createVehicle } from './services/vehicleService';
import { getLorryReceipts, createLorryReceipt, updateLorryReceipt, deleteLorryReceipt } from './services/lorryReceiptService';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice as deleteInvoiceService } from './services/invoiceService';
import { getPayments, createPayment } from './services/paymentService';
import { getTruckHiringNotes, createTruckHiringNote, updateTruckHiringNote } from './services/truckHiringNoteService';
import { resetApplicationData, loadMockData } from './services/dataService';

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
  | { name: 'LEDGER' }
  | { name: 'PENDING_PAYMENTS' }
  | { name: 'TRUCK_HIRING_NOTES' };

const App: React.FC = () => {
  const [view, setView] = useState<View>({ name: 'DASHBOARD' });
  
  const [lorryReceipts, setLorryReceipts] = useState<LorryReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [truckHiringNotes, setTruckHiringNotes] = useState<TruckHiringNote[]>([]);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', initialCompanyInfo);

  // Auth state
  const [passwordHash, setPasswordHash] = useLocalStorage<string | null>('app_password_hash', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  const fetchAllData = useCallback(async () => {
    try {
      const [
        fetchedCustomers,
        fetchedVehicles,
        fetchedLorryReceipts,
        fetchedInvoices,
        fetchedPayments,
        fetchedTruckHiringNotes,
      ] = await Promise.all([
        getCustomers(),
        getVehicles(),
        getLorryReceipts(),
        getInvoices(),
        getPayments(),
        getTruckHiringNotes(),
      ]);
      setCustomers(fetchedCustomers);
      setVehicles(fetchedVehicles);
      setLorryReceipts(fetchedLorryReceipts);
      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);
      setTruckHiringNotes(fetchedTruckHiringNotes);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      alert('Failed to load data from the server. Please check your connection and refresh the page.');
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
      setView({ name: 'DASHBOARD' });
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

  const saveLorryReceipt = async (lr: Partial<LorryReceipt>) => {
    try {
      if (lr._id) {
        await updateLorryReceipt(lr._id, lr);
      } else {
        await createLorryReceipt(lr as Omit<LorryReceipt, '_id' | 'id'>);
      }
      await fetchAllData(); // Refetch all data for consistency
      setView({ name: 'DASHBOARD' });
    } catch (error) {
      console.error('Failed to save lorry receipt:', error);
    }
  };
  
  const saveCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
    try {
      let savedCustomer;
      if (customerData._id) {
        savedCustomer = await updateCustomer(customerData._id, customerData);
      } else {
        savedCustomer = await createCustomer(customerData as Omit<Customer, 'id'>);
      }
      await fetchAllData(); // Refetch all data
      return savedCustomer;
    } catch (error) {
      console.error('Failed to save customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteCustomerService(id);
        await fetchAllData();
      } catch (error: any) {
        console.error('Failed to delete customer:', error);
        alert(`Failed to delete client: ${error.message}`);
      }
    }
  };

  const saveVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const newVehicle = await createVehicle(vehicleData as Omit<Vehicle, 'id'>);
      await fetchAllData();
      return newVehicle;
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      throw error;
    }
  };

  const saveInvoice = async (invoice: Partial<Invoice>) => {
    try {
      let savedInvoice;
      if (invoice._id) {
        savedInvoice = await updateInvoice(invoice._id, invoice);
      } else {
        savedInvoice = await createInvoice(invoice as Omit<Invoice, '_id' | 'id'>);
      }

      const invoicedLrIds = new Set<string>(savedInvoice.lorryReceipts.map(lr => lr._id));
      for (const lrId of invoicedLrIds) {
        await updateLorryReceipt(lrId, { status: LorryReceiptStatus.INVOICED });
      }

      await fetchAllData();
      setView({ name: 'DASHBOARD' });
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  };

  const saveTruckHiringNote = async (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable'>>) => {
    try {
      if (note._id) {
        await updateTruckHiringNote(note._id, note);
      } else {
        await createTruckHiringNote(note as any);
      }
      await fetchAllData();
    } catch (error) {
      console.error('Failed to save Truck Hiring Note:', error);
    }
  };

  const savePayment = async (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => {
    try {
      await createPayment(payment);
      await fetchAllData(); // Refetch all data to update invoices, THNs, and payments
    } catch (error) {
      console.error('Failed to save payment:', error);
    }
  };
  
  const updateLrStatus = async (id: string, status: LorryReceiptStatus) => {
    try {
        await updateLorryReceipt(id, { status });
        await fetchAllData();
    } catch (error) {
        console.error('Failed to update LR status:', error);
    }
  };
  
  const deleteLr = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Lorry Receipt?')) {
      try {
        await deleteLorryReceipt(id);
        await fetchAllData();
      } catch (error: any) {
        console.error('Failed to delete lorry receipt:', error);
        alert(`Failed to delete lorry receipt: ${error.message}`);
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      try {
        await deleteInvoiceService(id);
        await fetchAllData();
      } catch (error: any) {
        console.error('Failed to delete invoice:', error);
        alert(`Failed to delete invoice: ${error.message}`);
      }
    }
  };

  const handleResetData = async () => {
    try {
      await resetApplicationData();
      await fetchAllData();
      alert('Application data has been successfully reset.');
    } catch (error: any) {
      console.error('Failed to reset data:', error);
      alert(`An error occurred while resetting data: ${error.message}`);
    }
  };

  const handleLoadMockData = async () => {
    try {
      await loadMockData();
      await fetchAllData();
      alert('Mock data has been successfully loaded.');
    } catch (error: any) {
      console.error('Failed to load mock data:', error);
      alert(`An error occurred while loading mock data: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (view.name) {
      case 'CREATE_LR':
        return <LorryReceiptForm onSave={saveLorryReceipt} onCancel={() => setView({ name: 'DASHBOARD' })} customers={customers} vehicles={vehicles} onSaveCustomer={saveCustomer} lorryReceipts={lorryReceipts} onSaveVehicle={saveVehicle} />;
      case 'EDIT_LR':
        const lrToEdit = lorryReceipts.find(lr => lr._id === view.id);
        return lrToEdit ? <LorryReceiptForm onSave={saveLorryReceipt} onCancel={() => setView({ name: 'DASHBOARD' })} customers={customers} vehicles={vehicles} existingLr={lrToEdit} onSaveCustomer={saveCustomer} lorryReceipts={lorryReceipts} onSaveVehicle={saveVehicle} /> : <div>LR not found</div>;
      case 'VIEW_LR':
        const lrToView = lorryReceipts.find(lr => lr._id === view.id);
        return lrToView ? <LorryReceiptPDF lorryReceipt={lrToView} companyInfo={companyInfo} /> : <div>LR not found</div>;
      
      case 'CREATE_INVOICE':
        const availableLrs = lorryReceipts.filter(lr => [LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status));
        return <InvoiceForm onSave={saveInvoice} onCancel={() => setView({ name: 'DASHBOARD' })} availableLrs={availableLrs} customers={customers} companyInfo={companyInfo} />;
      case 'CREATE_INVOICE_FROM_LR':
        const lrToInvoice = lorryReceipts.find(lr => lr._id === view.lrId);
        if (!lrToInvoice) return <div>LR not found</div>;
        const availableLrsForNewInvoice = lorryReceipts.filter(lr => [LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status) || lr._id === view.lrId);
         return <InvoiceForm onSave={saveInvoice} onCancel={() => setView({ name: 'DASHBOARD' })} availableLrs={availableLrsForNewInvoice} customers={customers} preselectedLr={lrToInvoice} companyInfo={companyInfo} />;
      case 'EDIT_INVOICE':
         const invoiceToEdit = invoices.find(inv => inv._id === view.id);
         const lrsForEdit = lorryReceipts.filter(lr => (lr.status !== LorryReceiptStatus.INVOICED && lr.status !== LorryReceiptStatus.PAID) || invoiceToEdit?.lorryReceipts.some(ilr => ilr._id === lr._id));
         return invoiceToEdit ? <InvoiceForm onSave={saveInvoice} onCancel={() => setView({ name: 'DASHBOARD' })} availableLrs={lrsForEdit} customers={customers} existingInvoice={invoiceToEdit} companyInfo={companyInfo} /> : <div>Invoice not found</div>;
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
                  truckHiringNotes={truckHiringNotes}
                  onPasswordChange={handleChangePassword}
                  onResetData={handleResetData}
                  onLoadMockData={handleLoadMockData}
                />;

      case 'LEDGER':
        return <Ledger customers={customers} invoices={invoices} payments={payments} onSavePayment={savePayment} />;

      case 'PENDING_PAYMENTS':
        return <PendingPayments invoices={invoices} onSavePayment={savePayment} />;
      
      case 'CLIENTS':
        return <Clients customers={customers} onSave={saveCustomer} onDelete={deleteCustomer} />;

      case 'TRUCK_HIRING_NOTES':
        return <TruckHiringNotes notes={truckHiringNotes} onSave={saveTruckHiringNote} onSavePayment={savePayment} />;

      case 'DASHBOARD':
      default:
        return <Dashboard 
                 lorryReceipts={lorryReceipts} 
                 invoices={invoices}
                 payments={payments}
                 customers={customers}
                 vehicles={vehicles}
                 companyInfo={companyInfo}
                 onViewChange={setView}
                 onUpdateLrStatus={updateLrStatus}
                 onDeleteLr={deleteLr}
                 onDeleteInvoice={deleteInvoice}
                 onSavePayment={savePayment}
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
