
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { AIChat } from './components/AIChat';
import { AISettingsView } from './components/AISettingsView';
import { AIAutomationDashboard } from './components/AIAutomationDashboard';
import { PayablesView } from './components/PayablesView';
import { ReceivablesView } from './components/ReceivablesView';
import { PayrollView } from './components/PayrollView';
import { TaxFilingView } from './components/TaxFilingView';
import { FinancialReportsView } from './components/FinancialReportsView';
import { ConnectionsView } from './components/ConnectionsView';
import { IntegrationsView } from './components/IntegrationsView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { JournalEntriesView } from './components/JournalEntriesView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { EstimatesView } from './components/EstimatesView';
import { InventoryView } from './components/InventoryView';
import { BudgetingView } from './components/BudgetingView';
import { AuditTrailView } from './components/AuditTrailView';
import { ProjectsView } from './components/ProjectsView';

import { Spinner } from './components/ui/Spinner';

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
import { DEFAULT_CATEGORIES } from './components/TransactionsView';


import type { CategorizedTransaction, View, Employee, PayrollSummary, BankConnection, Bill, Invoice, PayrollRun, PayrollPayslip, PayrollAdjustment, Account, JournalEntry, Project, InventoryItem, PurchaseOrder, Estimate, Budget } from './types';

export default function App(): React.ReactNode {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<CategorizedTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>(DEFAULT_CATEGORIES);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [auditLog, setAuditLog] = useState(auditLogService.getLogs());
  const [currentProject, setCurrentProject] = useState<Project | undefined>();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const logAndRefresh = (log: string) => {
    auditLogService.add(log, "Tunde O.");
    setAuditLog(auditLogService.getLogs());
  };

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
      }
      
      const [
          fetchedConnections, fetchedEmployees, fetchedBills, fetchedInvoices, 
          fetchedProjects, fetchedInventory, fetchedPOs, fetchedEstimates,
          fetchedJEs, fetchedBudgets
        ] = await Promise.all([
        fetchConnections(), fetchEmployees(), fetchBills(), fetchInvoices(),
        fetchProjects(), fetchInventoryItems(), fetchPurchaseOrders(), fetchEstimates(),
        fetchJournalEntries(), fetchBudgets()
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

      if (fetchedConnections.length > 0) {
        const rawTransactions = await mockFetchTransactions();
        const categorized = await categorizeTransactions(rawTransactions, chartOfAccounts.map(c => c.name));
        setTransactions(categorized);
      } else {
        setTransactions([]);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [chartOfAccounts]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
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
    const newEmployee = await addEmployee(employeeData);
    setEmployees(prev => [...prev, newEmployee]);
    logAndRefresh(`Added new employee: ${newEmployee.name}`);
  };
    
  const handleUpdateEmployee = async (employeeData: Employee) => {
      const updatedEmployee = await updateEmployee(employeeData);
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
      logAndRefresh(`Updated employee details for: ${updatedEmployee.name}`);
      return updatedEmployee;
  };
    
  const handleRemoveEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this employee? This action cannot be undone.")) {
        const employeeToRemove = employees.find(e => e.id === id);
        await removeEmployee(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        if (employeeToRemove) {
          logAndRefresh(`Removed employee: ${employeeToRemove.name}`);
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
    logAndRefresh(`Ran payroll for ${period}`);
  };

  const handleUpdateTransaction = (transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(t => {
        if (t.id === transactionId) {
            logAndRefresh(`Updated transaction #${t.id.slice(-4)}`);
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
    logAndRefresh(`Manually added transaction: ${newTransaction.narration} for ${newTransaction.amount}`);
  };

  const handleConnectionsUpdated = () => {
    loadInitialData();
  };

  const handleAddProject = async (projectName: string) => {
    const newProject = await apiAddProject(projectName);
    setProjects(prev => [...prev, newProject]);
    logAndRefresh(`Created new project: ${newProject.name}`);
  }

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setActiveView('chat');
  };

  const handleAddBill = async (billData: Omit<Bill, 'id'|'status'|'issueDate'>) => {
    const newBill = await apiAddBill(billData);
    setBills(prev => [newBill, ...prev]);
    logAndRefresh(`Added new bill from ${newBill.vendor}`);
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
    logAndRefresh(`Paid bill #${bill.id.slice(-4)} from ${bill.vendor}`);
  };

  const handleAddInvoice = async (invoiceData: Omit<Invoice, 'id'|'status'|'issueDate'>) => {
    const newInvoice = await apiAddInvoice(invoiceData);
    setInvoices(prev => [newInvoice, ...prev]);
    logAndRefresh(`Added new invoice for ${newInvoice.customer}`);
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
    logAndRefresh(`Recorded payment for invoice #${invoice.id.slice(-4)} from ${invoice.customer}`);
  }
  
  const handleAddJournalEntry = async (entry: Omit<JournalEntry, 'id'|'date'>) => {
    const newEntry = await apiAddJournalEntry(entry);
    setJournalEntries(prev => [newEntry, ...prev]);
    logAndRefresh(`Created journal entry #${newEntry.id.slice(-4)}`);
  }

  const handleAddInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    const newItem = await apiAddInventoryItem(item);
    setInventory(prev => [newItem, ...prev]);
    logAndRefresh(`Added new inventory item: ${newItem.name}`);
  };

  const handleUpdateInventoryItem = async (item: InventoryItem) => {
    const updatedItem = await apiUpdateInventoryItem(item);
    setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    logAndRefresh(`Updated inventory item: ${updatedItem.name}`);
  };

  const handleAddPurchaseOrder = async (po: Omit<PurchaseOrder, 'id'|'status'|'issueDate'>) => {
    const newPO = await apiAddPurchaseOrder(po);
    setPurchaseOrders(prev => [newPO, ...prev]);
    logAndRefresh(`Created Purchase Order #${newPO.id.slice(-4)} for ${newPO.vendor}`);
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
    logAndRefresh(`Converted PO #${po.id.slice(-4)} to a bill.`);
  };

  const handleAddEstimate = async (est: Omit<Estimate, 'id'|'status'|'issueDate'>) => {
      const newEst = await apiAddEstimate(est);
      setEstimates(prev => [newEst, ...prev]);
      logAndRefresh(`Created Estimate #${newEst.id.slice(-4)} for ${newEst.customer}`);
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
      logAndRefresh(`Converted Estimate #${est.id.slice(-4)} to an invoice.`);
  };

  const handleSaveBudgets = async (updatedBudgets: Budget[]) => {
      await apiSaveBudgets(updatedBudgets);
      setBudgets(updatedBudgets);
      logAndRefresh('Updated monthly budgets.');
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-lg">Connecting to financial core and analyzing data...</p>
          </div>
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

    switch (activeView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} connections={connections} bills={bills} invoices={invoices} />;
      case 'transactions':
        return <TransactionsView 
                    transactions={transactions} 
                    onUpdateCategory={handleUpdateTransaction}
                    onAddTransaction={handleAddNewTransaction}
                    projects={projects}
                    chartOfAccounts={chartOfAccounts}
                />;
      case 'reports':
        return <FinancialReportsView transactions={transactions} payrollSummary={payrollSummary} bills={bills} invoices={invoices} inventory={inventory} projects={projects} chartOfAccounts={chartOfAccounts}/>;
      case 'payables':
        return <PayablesView bills={bills} onAddBill={handleAddBill} onPayBill={handlePayBill} inventoryItems={inventory} />;
      case 'receivables':
        return <ReceivablesView invoices={invoices} onAddInvoice={handleAddInvoice} onRecordPayment={handleRecordInvoicePayment} inventoryItems={inventory} />;
      case 'estimates':
        return <EstimatesView estimates={estimates} onAddEstimate={handleAddEstimate} onConvertToInvoice={handleConvertToInvoice} inventoryItems={inventory} />;
      case 'purchaseOrders':
        return <PurchaseOrdersView purchaseOrders={purchaseOrders} onAddPurchaseOrder={handleAddPurchaseOrder} onConvertToBill={handleConvertToBill} inventoryItems={inventory} />;
      case 'payroll':
        return <PayrollView 
                    employees={employees} 
                    payrollSummary={payrollSummary}
                    payrollHistory={payrollHistory}
                    onAddEmployee={handleAddEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onRemoveEmployee={handleRemoveEmployee}
                    onRunPayroll={handleRunPayroll}
                />;
      case 'inventory':
        return <InventoryView items={inventory} onAddItem={handleAddInventoryItem} onUpdateItem={handleUpdateInventoryItem} />;
      case 'taxFiling':
        return <TaxFilingView transactions={transactions} />;
      case 'connections':
        return <ConnectionsView onConnectionsUpdated={handleConnectionsUpdated} />;
      case 'integrations':
        return <IntegrationsView />;
      case 'chartOfAccounts':
        return <ChartOfAccountsView accounts={chartOfAccounts} setAccounts={setChartOfAccounts} />;
      case 'journalEntries':
        return <JournalEntriesView entries={journalEntries} onAddEntry={handleAddJournalEntry} accounts={chartOfAccounts} />;
      case 'budgeting':
          return <BudgetingView budgets={budgets} onSaveBudgets={handleSaveBudgets} expenseCategories={chartOfAccounts.filter(a => a.type === 'Expense').map(a => a.name)} />
      case 'auditTrail':
          return <AuditTrailView logs={auditLog} />;
      case 'projects':
          return <ProjectsView projects={projects} onAddProject={handleAddProject} onSelectProject={handleSelectProject} />;
      case 'chat':
        return <AIChat transactions={transactions} currentProject={currentProject} />;
      case 'ai-settings':
        return <AISettingsView />;
      case 'ai-automation':
        return <AIAutomationDashboard />;
      default:
        return <Dashboard transactions={transactions} connections={connections} bills={bills} invoices={invoices}/>;
    }
  };

  return (
    <div className="flex h-screen bg-dark-primary font-sans overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeView={activeView}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary">
          <div className="min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
