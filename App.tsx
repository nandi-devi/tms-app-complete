import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { LorryReceiptForm } from './components/LorryReceiptForm';
import { InvoiceForm } from './components/InvoiceForm';
import { LorryReceiptPDF } from './components/LorryReceiptPDF';
import { InvoicePDF } from './components/InvoicePDF';
import { Invoices } from './components/Invoices';
import { LorryReceipts } from './components/LorryReceipts';
import { Settings } from './components/Settings';
import { Ledger } from './components/Ledger';
import { PendingPayments } from './components/PendingPayments';
import { Clients } from './components/Clients';
import { TruckHiringNotes } from './components/TruckHiringNotes';
import { THNPdf } from './components/THNPdf';
import { LedgerPDF } from './components/LedgerPDF';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { hashPassword, login, getStoredToken, storeToken, removeToken } from './services/authService';
import type { LorryReceipt, Invoice, Customer, Vehicle, CompanyInfo, Payment } from './types';
import { LorryReceiptStatus } from './types';
import { initialCompanyInfo } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useCustomers } from './hooks/useCustomers';
import { useVehicles } from './hooks/useVehicles';
import { getLorryReceipts, createLorryReceipt, updateLorryReceipt, deleteLorryReceipt } from './services/lorryReceiptService';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice as deleteInvoiceService } from './services/invoiceService';
import { getPayments, createPayment } from './services/paymentService';
import { getTruckHiringNotes, createTruckHiringNote, updateTruckHiringNote } from './services/truckHiringNoteService';
import { resetApplicationData, backupData, restoreData } from './services/dataService';
import { ToastContainer, type Toast } from './components/ui/Toast';
import { PerformanceMonitor } from './components/ui/PerformanceMonitor';

export type View =
  | { name: 'DASHBOARD' }
  | { name: 'LORRY_RECEIPTS', filters?: any }
  | { name: 'INVOICES', filters?: any }
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
  | { name: 'TRUCK_HIRING_NOTES', filters?: any }
  | { name: 'VIEW_THN', id: string }
  | { name: 'VIEW_CLIENT_LEDGER_PDF', customerId: string }
  | { name: 'VIEW_COMPANY_LEDGER_PDF' };

const App: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<View[]>([{ name: 'DASHBOARD' }]);
  const currentView = viewHistory[viewHistory.length - 1];

  const navigateTo = (newView: View) => {
    setViewHistory(prev => [...prev, newView]);
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      setViewHistory(prev => prev.slice(0, -1));
    }
  };

  const navigateHome = () => {
    setViewHistory([{ name: 'DASHBOARD' }]);
  };
  
  const [lorryReceipts, setLorryReceipts] = useState<LorryReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { customers, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { vehicles, fetchVehicles, createVehicle } = useVehicles();
  const [truckHiringNotes, setTruckHiringNotes] = useState<TruckHiringNote[]>([]);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', initialCompanyInfo);

  // Auth state
  const [passwordHash, setPasswordHash] = useLocalStorage<string | null>('app_password_hash', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      const [
        fetchedLorryReceipts,
        fetchedInvoices,
        fetchedPayments,
        fetchedTruckHiringNotes,
      ] = await Promise.all([
        getLorryReceipts(),
        getInvoices(),
        getPayments(),
        getTruckHiringNotes(),
      ]);
      fetchCustomers();
      fetchVehicles();
      setLorryReceipts(fetchedLorryReceipts);
      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);
      setTruckHiringNotes(fetchedTruckHiringNotes);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      pushToast('error', 'Failed to load data from the server. Please check your connection and refresh.');
    }
  }, [fetchCustomers, fetchVehicles]);

  useEffect(() => {
    // Check if user has a valid token on app load
    const token = getStoredToken();
    if (token) {
      setIsAuthenticated(true);
    }
    fetchAllData();
  }, [fetchAllData]);

  const handleSetPassword = async (password: string) => {
      const hash = await hashPassword(password);
      setPasswordHash(hash);
      setIsAuthenticated(true);
  };

  const handleLogin = async (password: string) => {
      setIsLoading(true);
      setLoginError('');
      
      try {
        // First try JWT authentication with the backend
        const loginResult = await login(password);
        
        if (loginResult.success && loginResult.token) {
          storeToken(loginResult.token);
          setIsAuthenticated(true);
          setLoginError('');
        } else {
          // Fallback to local password hash verification
          if (!passwordHash) {
            setLoginError('No password set. Please set up a password first.');
            setIsLoading(false);
            return;
          }
          
          const inputHash = await hashPassword(password);
          if (inputHash === passwordHash) {
            setIsAuthenticated(true);
            setLoginError('');
          } else {
            setLoginError('Incorrect password. Please try again.');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('Login failed. Please try again.');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
  };

  const handleLogout = () => {
      removeToken();
      setIsAuthenticated(false);
      navigateHome();
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
      await fetchAllData();
      navigateHome();
    } catch (error) {
      // Bubble fieldErrors to LR form via toast and return them for inline mapping
      handleAndToastApiError(error, 'Failed to create lorry receipt');
      throw error;
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
      return savedCustomer;
    } catch (error) {
      handleAndToastApiError(error, 'Failed to save customer');
      throw error as any;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteCustomer(id);
      } catch (error: any) {
        console.error('Failed to delete customer:', error);
        alert(`Failed to delete client: ${error.message}`);
      }
    }
  };

  const saveVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const newVehicle = await createVehicle(vehicleData as Omit<Vehicle, 'id'>);
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
      navigateHome();
    } catch (error) {
      handleAndToastApiError(error, 'Failed to save invoice');
      throw error;
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
      handleAndToastApiError(error, 'Failed to save payment');
    }
  };
  
  const updateLrStatus = async (id: string, status: LorryReceiptStatus) => {
    try {
        await updateLorryReceipt(id, { status });
        await fetchAllData();
    } catch (error) {
        handleAndToastApiError(error, 'Failed to update LR status');
    }
  };
  
  const deleteLr = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Lorry Receipt?')) {
      try {
        await deleteLorryReceipt(id);
        await fetchAllData();
      } catch (error: any) {
        handleAndToastApiError(error, 'Failed to delete lorry receipt');
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      try {
        await deleteInvoiceService(id);
        await fetchAllData();
      } catch (error: any) {
        handleAndToastApiError(error, 'Failed to delete invoice');
      }
    }
  };

  const handleResetData = async () => {
    try {
      await resetApplicationData();
      await fetchAllData();
      pushToast('success', 'Application data has been successfully reset.');
    } catch (error: any) {
      handleAndToastApiError(error, 'Failed to reset data');
    }
  };

  const handleBackup = async () => {
    try {
      const data = await backupData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      handleAndToastApiError(error, 'Failed to backup data');
    }
  };

  const handleRestore = async (data: any) => {
    try {
      await restoreData(data);
      await fetchAllData();
      pushToast('success', 'Data has been successfully restored.');
    } catch (error: any) {
      handleAndToastApiError(error, 'Failed to restore data');
    }
  };

  // Toast state and helpers
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (kind: Toast['kind'], message: string) => {
    const id = Date.now() + Math.floor(Math.random()*1000);
    setToasts(prev => [...prev, { id, kind, message }]);
    // auto-dismiss after 5s
    setTimeout(() => dismissToast(id), 5000);
  };
  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleAndToastApiError = (err: any, fallback: string) => {
    // Try to surface server message or field errors when available
    if (err && typeof err === 'object') {
      // If service returned structured error
      const msg = (err.message && typeof err.message === 'string') ? err.message : '';
      pushToast('error', msg || fallback || 'Something went wrong. Please try again or contact support.');
    } else {
      pushToast('error', fallback || 'Something went wrong. Please try again or contact support.');
    }
  };

  const renderContent = () => {
    switch (currentView.name) {
      case 'CREATE_LR':
        return <LorryReceiptForm onSave={saveLorryReceipt} onCancel={goBack} customers={customers} vehicles={vehicles} onSaveCustomer={saveCustomer} lorryReceipts={lorryReceipts} onSaveVehicle={saveVehicle} />;
      case 'EDIT_LR':
        const lrToEdit = lorryReceipts.find(lr => lr._id === currentView.id);
        return lrToEdit ? <LorryReceiptForm onSave={saveLorryReceipt} onCancel={goBack} customers={customers} vehicles={vehicles} existingLr={lrToEdit} onSaveCustomer={saveCustomer} lorryReceipts={lorryReceipts} onSaveVehicle={saveVehicle} /> : <div>LR not found</div>;
      case 'VIEW_LR':
        const lrToView = lorryReceipts.find(lr => lr._id === currentView.id);
        return lrToView ? <LorryReceiptPDF lorryReceipt={lrToView} companyInfo={companyInfo} onBack={goBack} /> : <div>LR not found</div>;
      
      case 'CREATE_INVOICE':
        const availableLrs = lorryReceipts.filter(lr => [LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status));
        return <InvoiceForm onSave={saveInvoice} onCancel={goBack} availableLrs={availableLrs} customers={customers} companyInfo={companyInfo} />;
      case 'CREATE_INVOICE_FROM_LR':
        const lrToInvoice = lorryReceipts.find(lr => lr._id === currentView.lrId);
        if (!lrToInvoice) return <div>LR not found</div>;
        const availableLrsForNewInvoice = lorryReceipts.filter(lr => [LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status) || lr._id === currentView.lrId);
         return <InvoiceForm onSave={saveInvoice} onCancel={goBack} availableLrs={availableLrsForNewInvoice} customers={customers} preselectedLr={lrToInvoice} companyInfo={companyInfo} />;
      case 'EDIT_INVOICE':
         const invoiceToEdit = invoices.find(inv => inv._id === currentView.id);
         const lrsForEdit = lorryReceipts.filter(lr => (lr.status !== LorryReceiptStatus.INVOICED && lr.status !== LorryReceiptStatus.PAID) || invoiceToEdit?.lorryReceipts.some(ilr => ilr._id === lr._id));
         return invoiceToEdit ? <InvoiceForm onSave={saveInvoice} onCancel={goBack} availableLrs={lrsForEdit} customers={customers} existingInvoice={invoiceToEdit} companyInfo={companyInfo} /> : <div>Invoice not found</div>;
      case 'VIEW_INVOICE':
        const invoiceToView = invoices.find(inv => inv._id === currentView.id);
        return invoiceToView ? <InvoicePDF invoice={invoiceToView} companyInfo={companyInfo} customers={customers} onBack={goBack} /> : <div>Invoice not found</div>;
      
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
                  onBackup={handleBackup}
                  onRestore={handleRestore}
                  onBack={goBack}
                />;

      case 'LEDGER':
        return <Ledger customers={customers} invoices={invoices} payments={payments} truckHiringNotes={truckHiringNotes} onViewChange={navigateTo} onBack={goBack} />;

      case 'VIEW_CLIENT_LEDGER_PDF':
        const customerId = currentView.customerId;
        const customer = customers.find(c => c._id === customerId);
        const customerInvoices = invoices.filter(inv => inv.customer?._id === customerId);
        const customerPayments = payments.filter(p => p.invoiceId?.customer?._id === customerId);

        const invoiceTx = customerInvoices.map(inv => ({
            type: 'invoice', date: inv.date, particulars: `Invoice No: ${inv.invoiceNumber}`, debit: inv.grandTotal, credit: 0
        }));
        const paymentTx = customerPayments.map(p => ({
            type: 'payment', date: p.date, particulars: `Payment for INV-${p.invoiceId?.invoiceNumber}`, debit: 0, credit: p.amount
        }));

        let runningBalance = 0;
        const transactions = [...invoiceTx, ...paymentTx]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(tx => {
                runningBalance += (tx.debit - tx.credit);
                return { ...tx, balance: `${Math.abs(runningBalance).toFixed(2)} ${runningBalance >= 0 ? 'Dr' : 'Cr'}` };
            });

        return customer ? <LedgerPDF
                    title={`Client-Ledger-${customer.name}`}
                    transactions={transactions}
                    companyInfo={companyInfo}
                    columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'particulars', label: 'Particulars' },
                        { key: 'debit', label: 'Debit (₹)', align: 'right' },
                        { key: 'credit', label: 'Credit (₹)', align: 'right' },
                        { key: 'balance', label: 'Balance (₹)', align: 'right' },
                    ]}
                    summary={[
                        { label: 'Client', value: customer.name },
                        { label: 'Closing Balance', value: transactions.length > 0 ? transactions[transactions.length - 1].balance : '0.00 Dr', color: 'font-bold' }
                    ]}
                    onBack={goBack}
                /> : <div>Customer not found</div>;

      case 'VIEW_COMPANY_LEDGER_PDF':
        const invoiceTxComp = invoices.map(inv => ({ type: 'income', date: inv.date, particulars: `Invoice No: ${inv.invoiceNumber} to ${inv.customer?.name}`, amount: inv.grandTotal }));
        const thnTxComp = truckHiringNotes.map(thn => ({ type: 'expense', date: thn.date, particulars: `THN No: ${thn.thnNumber} to ${thn.truckOwnerName}`, amount: thn.freight }));
        const companyTransactions = [...invoiceTxComp, ...thnTxComp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return <LedgerPDF
                    title="Company-Ledger"
                    transactions={companyTransactions}
                    companyInfo={companyInfo}
                    columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'type', label: 'Type' },
                        { key: 'particulars', label: 'Particulars' },
                        { key: 'amount', label: 'Amount (₹)', align: 'right' },
                    ]}
                    onBack={goBack}
                />;

      case 'PENDING_PAYMENTS':
        return <PendingPayments invoices={invoices} onSavePayment={savePayment} onBack={goBack} />;
      
      case 'CLIENTS':
        return <Clients customers={customers} onSave={saveCustomer} onDelete={handleDeleteCustomer} onBack={goBack} />;

      case 'TRUCK_HIRING_NOTES':
        return <TruckHiringNotes notes={truckHiringNotes} onSave={saveTruckHiringNote} onSavePayment={savePayment} onViewChange={navigateTo} onBack={goBack} initialFilters={currentView.filters} />;

      case 'VIEW_THN':
        const thnToView = truckHiringNotes.find(thn => thn._id === currentView.id);
        return thnToView ? <THNPdf truckHiringNote={thnToView} companyInfo={companyInfo} onBack={goBack} /> : <div>THN not found</div>;

      case 'LORRY_RECEIPTS':
        return <LorryReceipts
                  lorryReceipts={lorryReceipts}
                  customers={customers}
                  vehicles={vehicles}
                  companyInfo={companyInfo}
                  onViewChange={navigateTo}
                  onUpdateLrStatus={updateLrStatus}
                  onDeleteLr={deleteLr}
                  onBack={goBack}
                  initialFilters={currentView.filters}
                />;

      case 'INVOICES':
        return <Invoices
                  invoices={invoices}
                  payments={payments}
                  customers={customers}
                  companyInfo={companyInfo}
                  onViewChange={navigateTo}
                  onDeleteInvoice={deleteInvoice}
                  onSavePayment={savePayment}
                  onBack={goBack}
                  initialFilters={currentView.filters}
                />;

      case 'DASHBOARD':
      default:
        return <Dashboard 
                 lorryReceipts={lorryReceipts} 
                 invoices={invoices}
                 payments={payments}
                 customers={customers}
                 vehicles={vehicles}
                 truckHiringNotes={truckHiringNotes}
                 companyInfo={companyInfo}
                 onViewChange={navigateTo}
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
      return <Login onLogin={handleLogin} error={loginError} isLoading={isLoading} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navigation 
        currentView={currentView} 
        onViewChange={navigateTo} 
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />
      
      {/* Main content area with responsive layout */}
      <div className="lg:pl-64">
        {/* Mobile header spacer */}
        <div className="h-16 lg:h-0 safe-area-inset-top" />
        
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">
            {renderContent()}
          </div>
        </main>
        
        {/* Mobile bottom nav spacer */}
        <div className="h-20 lg:h-0 safe-area-inset-bottom" />
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <PerformanceMonitor />
    </div>
  );
};

export default App;
