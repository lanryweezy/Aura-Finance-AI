
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AuthView } from './components/AuthView';
import { Spinner } from './components/ui/Spinner';
import { DashboardSkeleton, TableSkeleton } from './components/ui/Skeleton';

// Lazy load non-critical views
const TransactionsView = lazy(() => import('./components/TransactionsView').then(m => ({ default: m.TransactionsView })));
const AIChat = lazy(() => import('./components/AIChat').then(m => ({ default: m.AIChat })));
const PayablesView = lazy(() => import('./components/PayablesView').then(m => ({ default: m.PayablesView })));
const ReceivablesView = lazy(() => import('./components/ReceivablesView').then(m => ({ default: m.ReceivablesView })));
const PayrollView = lazy(() => import('./components/PayrollView').then(m => ({ default: m.PayrollView })));
const TaxFilingView = lazy(() => import('./components/TaxFilingView').then(m => ({ default: m.TaxFilingView })));
const FinancialReportsView = lazy(() => import('./components/FinancialReportsView').then(m => ({ default: m.FinancialReportsView })));
const ConnectionsView = lazy(() => import('./components/ConnectionsView').then(m => ({ default: m.ConnectionsView })));
const IntegrationsView = lazy(() => import('./components/IntegrationsView').then(m => ({ default: m.IntegrationsView })));
const ChartOfAccountsView = lazy(() => import('./components/ChartOfAccountsView').then(m => ({ default: m.ChartOfAccountsView })));
const JournalEntriesView = lazy(() => import('./components/JournalEntriesView').then(m => ({ default: m.JournalEntriesView })));
const PurchaseOrdersView = lazy(() => import('./components/PurchaseOrdersView').then(m => ({ default: m.PurchaseOrdersView })));
const EstimatesView = lazy(() => import('./components/EstimatesView').then(m => ({ default: m.EstimatesView })));
const InventoryView = lazy(() => import('./components/InventoryView').then(m => ({ default: m.InventoryView })));
const BudgetingView = lazy(() => import('./components/BudgetingView').then(m => ({ default: m.BudgetingView })));
const AuditTrailView = lazy(() => import('./components/AuditTrailView').then(m => ({ default: m.AuditTrailView })));
const ProjectsView = lazy(() => import('./components/ProjectsView').then(m => ({ default: m.ProjectsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const SubscriptionView = lazy(() => import('./components/SubscriptionView').then(m => ({ default: m.SubscriptionView })));
const ContactsView = lazy(() => import('./components/ContactsView').then(m => ({ default: m.ContactsView })));
const LegalView = lazy(() => import('./components/LegalView').then(m => ({ default: m.LegalView })));

import { OnboardingTour } from './components/ui/OnboardingTour';
import { useToast } from './components/ui/Toast';
import { monitoringService } from './services/monitoringService';

import { fetchTransactions as mockFetchTransactions } from './services/monoService';
import { categorizeTransactions } from './services/geminiService';
import { fetchEmployees, addEmployee, updateEmployee, removeEmployee } from './services/employeeService';
import { calculateDeductions } from './services/taxCalculatorService';
import { fetchConnections } from './services/connectionService';
import { fetchBills, addBill as apiAddBill } from './services/billService';
import { fetchInvoices, addInvoice as apiAddInvoice } from './services/receivablesService';
import { auditLogService } from './services/auditLogService';
import { fetchProjects, addProject as apiAddProject } from './services/projectService';
import { fetchInventoryItems, addInventoryItem as apiAddInventoryItem, updateInventoryItem as apiUpdateInventoryItem, updateStock } from './services/inventoryService';
import { fetchPurchaseOrders, addPurchaseOrder as apiAddPurchaseOrder } from './services/purchaseOrderService';
import { fetchEstimates, addEstimate as apiAddEstimate } from './services/estimateService';
import { fetchJournalEntries, addJournalEntry as apiAddJournalEntry } from './services/journalEntryService';
import { fetchBudgets, saveBudgets as apiSaveBudgets } from './services/budgetService';
import { authService } from './services/authService';
import { fetchContacts, addContact as apiAddContact, updateContact as apiUpdateContact } from './services/contactService';
import { DEFAULT_CATEGORIES } from './constants/accounting';

import type { CategorizedTransaction, View, Employee, PayrollSummary, BankConnection, Bill, Invoice, PayrollRun, PayrollPayslip, PayrollAdjustment, Account, JournalEntry, Project, InventoryItem, PurchaseOrder, Estimate, Budget, User, Organization, Contact } from './types';

export default function App(): React.ReactNode {
  const { showToast } = useToast();
  const store = useAppStore();
  const {
    user, setUser,
    activeView, setActiveView,
    transactions, setTransactions,
    employees, setEmployees,
    connections, setConnections,
    bills, setBills,
    invoices, setInvoices,
    payrollHistory, setPayrollHistory,
    chartOfAccounts, setChartOfAccounts,
    journalEntries, setJournalEntries,
    projects, setProjects,
    inventory, setInventory,
    purchaseOrders, setPurchaseOrders,
    estimates, setEstimates,
    budgets, setBudgets,
    contacts, setContacts,
    auditLog, setAuditLog,
    isLoading, setIsLoading,
    error, setError,
    theme
  } = store;
  
  // Check for existing session on mount
  useEffect(() => {
    const session = authService.getCurrentUser();
    if (session) {
        setUser(session.user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (loggedInUser: User, org: Organization) => {
      setUser(loggedInUser);
      loadInitialData();
  };

  const handleLogout = async () => {
      await authService.logout();
      setUser(null);
      // Optional: Clear sensitive state here if needed
  };

  const logAndRefresh = (log: string, module: string = 'General') => {
    auditLogService.add(log, user?.name || "System", module);
    setAuditLog(auditLogService.getLogs());
  };

  const loadInitialData = useCallback(async () => {
    if (!user) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [
          fetchedConnections, fetchedEmployees, fetchedBills, fetchedInvoices, 
          fetchedProjects, fetchedInventory, fetchedPOs, fetchedEstimates,
          fetchedJEs, fetchedBudgets, fetchedContacts
        ] = await Promise.all([
        fetchConnections(), fetchEmployees(), fetchBills(), fetchInvoices(),
        fetchProjects(), fetchInventoryItems(), fetchPurchaseOrders(), fetchEstimates(),
        fetchJournalEntries(), fetchBudgets(), fetchContacts()
      ]);

      setConnections(fetchedConnections);
      setEmployees(fetchedEmployees);
      setBills(fetchedBills);
      setInvoices(fetchedInvoices);
      setProjects(fetchedProjects);
      setInventory(fetchedInventory);
      setPurchaseOrders(fetchedPOs);
      setEstimates(fetchedEstimates);
      setJournalEntries(fetchedJEs);
      setBudgets(fetchedBudgets);
      setContacts(fetchedContacts);

      if (fetchedConnections.length > 0) {
        const rawTransactions = await mockFetchTransactions();
        const categorized = await categorizeTransactions(rawTransactions, chartOfAccounts.map(c => c.name));
        setTransactions(categorized);
      } else {
        setTransactions([]);
      }

    } catch (err) {
      monitoringService.trackError('APP_INIT', err instanceof Error ? err : String(err));
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [chartOfAccounts, user]);

  useEffect(() => {
    if (user) {
        loadInitialData();
    }
  }, [loadInitialData, user]);

  // Session Timeout Implementation
  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      let lastReset = 0;

      const resetTimeout = (e?: Event) => {
          const now = Date.now();
          // Throttle event listeners to prevent excessive timer churn
          if (e && now - lastReset < 2000) return;
          lastReset = now;

          if (timeout) clearTimeout(timeout);
          // Default timeout: 30 minutes, or from org settings
          const duration = (authService.getCurrentUser()?.org.sessionTimeout || 30) * 60 * 1000;
          timeout = setTimeout(() => {
              if (authService.getCurrentUser()) {
                  handleLogout();
                  showToast('Session expired due to inactivity.', 'info');
              }
          }, duration);
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(name => document.addEventListener(name, resetTimeout));

      resetTimeout();

      return () => {
          events.forEach(name => document.removeEventListener(name, resetTimeout));
          if (timeout) clearTimeout(timeout);
      };
  }, [user]);
  
  const payrollSummary: PayrollSummary = useMemo(() => {
    return employees.reduce((acc, emp) => {
        const deductions = calculateDeductions(emp.grossSalary);
        acc.totalGross += deductions.grossSalary;
        acc.totalPAYE += deductions.paye;
        acc.totalPension += deductions.pension;
        acc.totalNHF += deductions.nhf;
        acc.totalNet += deductions.netSalary;
        return acc;
    }, { totalGross: 0, totalPAYE: 0, totalPension: 0, totalNHF: 0, totalNet: 0, employeeCount: employees.length });
  }, [employees]);
  
  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
        const newEmployee = await addEmployee(employeeData);
        setEmployees(prev => [...prev, newEmployee]);
        logAndRefresh(`Added new employee: ${newEmployee.name}`, 'Payroll');
        showToast('Employee added successfully', 'success');
    } catch (err) {
        showToast('Failed to add employee', 'error');
    }
  };
    
  const handleUpdateEmployee = async (employeeData: Employee) => {
      const updatedEmployee = await updateEmployee(employeeData);
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
      logAndRefresh(`Updated employee details for: ${updatedEmployee.name}`, 'Payroll');
      return updatedEmployee;
  };
    
  const handleRemoveEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this employee? This action cannot be undone.")) {
        const employeeToRemove = employees.find(e => e.id === id);
        await removeEmployee(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        if (employeeToRemove) {
          logAndRefresh(`Removed employee: ${employeeToRemove.name}`, 'Payroll');
        }
    }
  };
    
  const handleRunPayroll = (period: string, adjustments: Record<string, PayrollAdjustment>) => {
    const payslips: PayrollPayslip[] = employees.map(emp => {
      const adj = adjustments[emp.id] || { bonus: 0, deduction: 0 };
      const { netSalary, paye, pension, nhf, totalIncome, totalStatutoryDeductions } = calculateDeductions(emp.grossSalary, adj.bonus, adj.deduction);
      
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        grossSalary: emp.grossSalary,
        bonus: adj.bonus,
        deduction: adj.deduction,
        totalIncome,
        paye,
        pension,
        nhf,
        totalDeductions: totalStatutoryDeductions + adj.deduction,
        netSalary,
      };
    });

    const summary = payslips.reduce((acc, p) => {
      acc.totalGross += p.grossSalary;
      acc.totalBonuses += p.bonus;
      acc.totalDeductions += p.totalDeductions;
      acc.totalNet += p.netSalary;
      acc.totalPAYE += p.paye;
      acc.totalPension += p.pension;
      return acc;
    }, { totalGross: 0, totalBonuses: 0, totalDeductions: 0, totalNet: 0, totalPAYE: 0, totalPension: 0 });

    const newRun: PayrollRun = {
      id: `pr_${Date.now()}`,
      runDate: new Date().toISOString(),
      period,
      summary: { ...summary, employeeCount: employees.length },
      payslips
    };

    setPayrollHistory(prev => [newRun, ...prev]);
    logAndRefresh(`Ran payroll for ${period}`, 'Payroll');
  };

  const handleUpdateTransaction = (transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(t => {
        if (t.id === transactionId) {
            logAndRefresh(`Updated transaction #${t.id.slice(-4)}`, 'Transactions');
            return { ...t, category: newCategory, projectId: newProjectId, receiptUrl: newReceiptUrl };
        }
        return t;
      })
    );
  };
  
  const handleAddNewTransaction = (newTransactionData: Omit<CategorizedTransaction, 'id' | 'balance'>) => {
    const newTransaction: CategorizedTransaction = {
      ...newTransactionData,
      id: `manual_txn_${Date.now()}`,
    };
    setTransactions(prev => 
        [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    logAndRefresh(`Added transaction: ${newTransaction.narration} for ${newTransaction.amount}`, 'Transactions');
  };

  const handleConnectionsUpdated = () => {
    loadInitialData();
  };

  const handleAddProject = async (projectName: string) => {
    const newProject = await apiAddProject(projectName);
    setProjects(prev => [...prev, newProject]);
    logAndRefresh(`Created new project: ${newProject.name}`, 'Projects');
    showToast(`Project "${newProject.name}" created!`, 'success');
  }

  const handleAddBill = async (billData: Omit<Bill, 'id'|'status'|'issueDate'>) => {
    const newBill = await apiAddBill(billData);
    setBills(prev => [newBill, ...prev]);
    logAndRefresh(`Added new bill from ${newBill.vendor}`, 'Payables');
    showToast(`Bill from ${newBill.vendor} recorded.`, 'success');
  }

  const handlePayBill = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    handleAddNewTransaction({
        date: new Date().toISOString(),
        amount: bill.amount,
        narration: `Payment for bill #${bill.id.slice(-4)} to ${bill.vendor}`,
        type: 'debit',
        category: 'Accounts Payable',
        projectId: bill.projectId
    });

    setBills(prev => prev.map(b => b.id === billId ? {...b, status: 'Paid'} : b));
    logAndRefresh(`Paid bill #${bill.id.slice(-4)} from ${bill.vendor}`, 'Payables');
    showToast(`Bill for ${bill.vendor} marked as Paid.`, 'success');
  };

  const handleAddInvoice = async (invoiceData: Omit<Invoice, 'id'|'status'|'issueDate'>) => {
    const newInvoice = await apiAddInvoice(invoiceData);
    setInvoices(prev => [newInvoice, ...prev]);
    logAndRefresh(`Added new invoice for ${newInvoice.customer}`, 'Receivables');
    showToast(`Invoice for ${newInvoice.customer} created.`, 'success');
  };

  const handleRecordInvoicePayment = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    // Create transaction for payment received
    handleAddNewTransaction({
        date: new Date().toISOString(),
        amount: invoice.total,
        narration: `Payment received for invoice #${invoice.id.slice(-4)} from ${invoice.customer}`,
        type: 'credit',
        category: 'Accounts Receivable',
        projectId: invoice.projectId,
    });

    // Reduce stock for inventory items sold
    invoice.lineItems.forEach(li => {
        if(li.inventoryItemId) {
            updateStock(li.inventoryItemId, -li.quantity);
        }
    });
    // Refresh inventory state
    fetchInventoryItems().then(setInventory);

    setInvoices(prev => prev.map(i => i.id === invoiceId ? {...i, status: 'Paid'} : i));
    logAndRefresh(`Recorded payment for invoice #${invoice.id.slice(-4)} from ${invoice.customer}`, 'Receivables');
  }
  
  const handleAddJournalEntry = async (entry: Omit<JournalEntry, 'id'|'date'>) => {
    const newEntry = await apiAddJournalEntry(entry);
    setJournalEntries(prev => [newEntry, ...prev]);
    logAndRefresh(`Created journal entry #${newEntry.id.slice(-4)}`, 'Accounting');
    showToast('Journal entry saved successfully!', 'success');
  }

  const handleAddInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    const newItem = await apiAddInventoryItem(item);
    setInventory(prev => [newItem, ...prev]);
    logAndRefresh(`Added new inventory item: ${newItem.name}`, 'Inventory');
    showToast(`Added ${newItem.name} to inventory.`, 'success');
  };

  const handleUpdateInventoryItem = async (item: InventoryItem) => {
    const updatedItem = await apiUpdateInventoryItem(item);
    setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    logAndRefresh(`Updated inventory item: ${updatedItem.name}`, 'Inventory');
    showToast(`Updated ${updatedItem.name} details.`, 'success');
  };

  const handleAddPurchaseOrder = async (po: Omit<PurchaseOrder, 'id'|'status'|'issueDate'>) => {
    const newPO = await apiAddPurchaseOrder(po);
    setPurchaseOrders(prev => [newPO, ...prev]);
    logAndRefresh(`Created Purchase Order #${newPO.id.slice(-4)} for ${newPO.vendor}`, 'Purchases');
    showToast(`PO #${newPO.id.slice(-6).toUpperCase()} created for ${newPO.vendor}.`, 'success');
  };

  const handleConvertToBill = (po: PurchaseOrder) => {
    const billData: Omit<Bill, 'id'|'status'|'issueDate'> = {
        vendor: po.vendor,
        amount: po.total,
        description: `From PO #${po.id.slice(-4)}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        whtApplies: false,
        lineItems: po.lineItems.map(li => ({...li, description: li.name})),
        projectId: po.projectId,
    };
    handleAddBill(billData);
    setPurchaseOrders(prev => prev.map(p => p.id === po.id ? {...p, status: 'Completed'} : p));
    logAndRefresh(`Converted PO #${po.id.slice(-4)} to a bill.`, 'Purchases');
  };

  const handleAddEstimate = async (est: Omit<Estimate, 'id'|'status'|'issueDate'>) => {
      const newEst = await apiAddEstimate(est);
      setEstimates(prev => [newEst, ...prev]);
      logAndRefresh(`Created Estimate #${newEst.id.slice(-4)} for ${newEst.customer}`, 'Sales');
  };

  const handleConvertToInvoice = (est: Estimate) => {
      const subtotal = est.lineItems.reduce((sum, item) => sum + item.total, 0);
      const vat = subtotal * 0.075;
      const total = subtotal + vat;

      const invoiceData: Omit<Invoice, 'id'|'status'|'issueDate'> = {
          customer: est.customer,
          description: `From Estimate #${est.id.slice(-4)}`,
          amount: subtotal,
          vat: vat,
          total: total,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          whtApplied: false,
          lineItems: est.lineItems.map(li => ({...li, description: li.name})),
          projectId: est.projectId,
      };

      handleAddInvoice(invoiceData);
      setEstimates(prev => prev.map(e => e.id === est.id ? {...e, status: 'Accepted'} : e));
      logAndRefresh(`Converted Estimate #${est.id.slice(-4)} to an invoice.`, 'Sales');
  };

  const handleSaveBudgets = async (updatedBudgets: Budget[]) => {
      await apiSaveBudgets(updatedBudgets);
      setBudgets(updatedBudgets);
      logAndRefresh('Updated monthly budgets.', 'Budgeting');
  };

  const handleAddContact = async (contactData: Omit<Contact, 'id'>) => {
      const newContact = await apiAddContact(contactData);
      setContacts(prev => [...prev, newContact]);
      logAndRefresh(`Added new ${contactData.type}: ${newContact.name}`, 'Contacts');
  };

  const handleUpdateContact = async (contact: Contact) => {
      const updated = await apiUpdateContact(contact);
      setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
      logAndRefresh(`Updated contact info: ${updated.name}`, 'Contacts');
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8">
            {activeView === 'dashboard' ? <DashboardSkeleton /> : <TableSkeleton />}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
            <button
                onClick={loadInitialData}
                className="mt-6 px-4 py-2 bg-brand-pink text-white font-semibold rounded-lg hover:bg-brand-pink/80 transition-colors"
            >
                Retry
            </button>
          </div>
        </div>
      );
    }

    const viewMap: Record<View, React.ReactNode> = {
      dashboard: <Dashboard
                    user={user}
                    transactions={transactions} 
                    connections={connections}
                    bills={bills}
                    invoices={invoices}
                    onQuickAction={setActiveView}
                    onAddTransaction={handleAddNewTransaction}
                 />,
      transactions: <TransactionsView
                        transactions={transactions}
                        onUpdateCategory={handleUpdateTransaction}
                        onAddTransaction={handleAddNewTransaction}
                        projects={projects}
                        chartOfAccounts={chartOfAccounts}
                    />,
      reports: <FinancialReportsView transactions={transactions} payrollSummary={payrollSummary} bills={bills} invoices={invoices} inventory={inventory} projects={projects} chartOfAccounts={chartOfAccounts}/>,
      payables: <PayablesView bills={bills} onAddBill={handleAddBill} onPayBill={handlePayBill} inventoryItems={inventory} />,
      receivables: <ReceivablesView invoices={invoices} onAddInvoice={handleAddInvoice} onRecordPayment={handleRecordInvoicePayment} inventoryItems={inventory} />,
      estimates: <EstimatesView estimates={estimates} onAddEstimate={handleAddEstimate} onConvertToInvoice={handleConvertToInvoice} inventoryItems={inventory} />,
      purchaseOrders: <PurchaseOrdersView purchaseOrders={purchaseOrders} onAddPurchaseOrder={handleAddPurchaseOrder} onConvertToBill={handleConvertToBill} inventoryItems={inventory} />,
      payroll: <PayrollView
                    employees={employees} 
                    payrollSummary={payrollSummary}
                    payrollHistory={payrollHistory}
                    onAddEmployee={handleAddEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onRemoveEmployee={handleRemoveEmployee}
                    onRunPayroll={handleRunPayroll}
                />,
      inventory: <InventoryView items={inventory} onAddItem={handleAddInventoryItem} onUpdateItem={handleUpdateInventoryItem} />,
      contacts: <ContactsView contacts={contacts} invoices={invoices} bills={bills} onAddContact={handleAddContact} onUpdateContact={handleUpdateContact} />,
      taxFiling: <TaxFilingView transactions={transactions} />,
      connections: <ConnectionsView onConnectionsUpdated={handleConnectionsUpdated} />,
      integrations: <IntegrationsView />,
      chartOfAccounts: <ChartOfAccountsView accounts={chartOfAccounts} setAccounts={setChartOfAccounts} />,
      journalEntries: <JournalEntriesView entries={journalEntries} onAddEntry={handleAddJournalEntry} accounts={chartOfAccounts} />,
      budgeting: <BudgetingView budgets={budgets} onSaveBudgets={handleSaveBudgets} expenseCategories={chartOfAccounts.filter(a => a.type === 'Expense').map(a => a.name)} />,
      auditTrail: <AuditTrailView logs={auditLog} />,
      projects: <ProjectsView projects={projects} transactions={transactions} onAddProject={handleAddProject} />,
      settings: <SettingsView />,
      subscription: <SubscriptionView />,
      chat: <AIChat transactions={transactions} bills={bills} invoices={invoices} />,
      privacy: <LegalView type="privacy" />,
      terms: <LegalView type="terms" />
    };

    return (
        <Suspense fallback={
            <div className="p-8">
                 {activeView === 'dashboard' ? <DashboardSkeleton /> : <TableSkeleton />}
            </div>
        }>
            {viewMap[activeView] || viewMap.dashboard}
        </Suspense>
    );
  };

  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen font-sans ${theme === 'dark' ? 'bg-dark-primary text-white dark' : 'bg-gray-50 text-gray-900'}`}>
      {user && <OnboardingTour />}
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header user={user} />
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 rounded-tl-3xl ${theme === 'dark' ? 'bg-dark-secondary/30 border-white/5' : 'bg-white border-gray-200'} backdrop-blur-sm border-t border-l shadow-2xl relative`}>
           {/* Rich gradient background for world-class depth */}
           {theme === 'dark' && (
               <>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[128px] pointer-events-none -z-10 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[128px] pointer-events-none -z-10 opacity-50"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-dark-primary/60 pointer-events-none -z-10"></div>
               </>
           )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
