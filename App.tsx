
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AuthView } from './components/AuthView';
import { LandingView } from './components/LandingView';
import { Spinner } from './components/ui/Spinner';
import { DashboardSkeleton, TableSkeleton } from './components/ui/Skeleton';
import { OnboardingTour } from './components/ui/OnboardingTour';
import { CommandPalette } from './components/ui/CommandPalette';
import { UpgradeOverlay } from './components/ui/UpgradeOverlay';
import { useToast } from './components/ui/Toast';
import { useHotkeys } from './services/hooks/useHotkeys';
import { monitoringService } from './services/monitoringService';
import { authService } from './services/authService';
import { billingService } from './services/billingService';
import { validateEnv } from './services/envConfig';
import { fetchConnections } from './services/connectionService';
import { fetchInventoryItems, updateStock } from './services/inventoryService';
import { entityService } from './services/entityService';
import { fetchBudgets } from './services/budgetService';
import { auditLogService } from './services/auditLogService';

import { usePayroll } from './services/hooks/usePayroll';
import { useTransactions } from './services/hooks/useTransactions';
import { useBills, useInvoices } from './services/hooks/useBillsAndInvoices';
import { useInventory, useProjects, useJournalEntries, usePurchases, useBudgets, useContacts, useAssets } from './services/hooks/useDomainEntities';

import type { View, User, PurchaseOrder, Estimate, Bill, Invoice } from './types';

// Lazy load views
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
const SharedReportView = lazy(() => import('./components/SharedReportView').then(m => ({ default: m.SharedReportView })));
const FixedAssetsView = lazy(() => import('./components/FixedAssetsView').then(m => ({ default: m.FixedAssetsView })));
const BankReconciliationView = lazy(() => import('./components/BankReconciliationView').then(m => ({ default: m.BankReconciliationView })));
const RecurringTransactionsView = lazy(() => import('./components/RecurringTransactionsView').then(m => ({ default: m.RecurringTransactionsView })));
const YearEndClosingView = lazy(() => import('./components/YearEndClosingView').then(m => ({ default: m.YearEndClosingView })));
const LegalView = lazy(() => import('./components/LegalView').then(m => ({ default: m.LegalView })));

export default function App(): React.ReactNode {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user, setUser, activeView, setActiveView,
    chartOfAccounts, setChartOfAccounts, setConnections, setEntities,
    setInventory, setAuditLog, isLoading, setIsLoading, error, setError,
    theme, highContrast, closingHistory, setClosingHistory,
  } = useAppStore();

  const [showAuth, setShowAuth] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  const payroll = usePayroll();
  const transactions = useTransactions();
  const bills = useBills();
  const invoices = useInvoices();
  const inventory = useInventory();
  const projects = useProjects();
  const journalEntries = useJournalEntries();
  const purchases = usePurchases();
  const budgetsHook = useBudgets();
  const contactsHook = useContacts();
  const assets = useAssets();

  useEffect(() => {
    const session = authService.getCurrentUser();
    if (session) setUser(session.user);
    const env = validateEnv();
    if (env.warnings.length > 0) console.warn('[Aura]', env.warnings);
  }, [setUser]);

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    if (user && path !== activeView) setActiveView(path as View);
  }, [location.pathname, user, activeView, setActiveView]);

  const loadInitialData = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const [conns, inv, ents, budge] = await Promise.all([
        fetchConnections(), fetchInventoryItems(), entityService.fetchEntities(), fetchBudgets(),
      ]);
      setConnections(conns);
      setInventory(inv);
      setEntities(ents);
      budgetsHook.handleSave(budge);
      const logs = await auditLogService.getLogs();
      setAuditLog(logs);
      if (conns.length > 0) await transactions.loadTransactions();
    } catch (err) {
      monitoringService.trackError('APP_INIT', err instanceof Error ? err : String(err));
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [user, chartOfAccounts]);

  useEffect(() => { if (user) loadInitialData(); }, [loadInitialData, user]);

  const handleLogin = (u: User) => { setUser(u); loadInitialData(); navigate('/dashboard'); };
  const handleLogout = async () => { await authService.logout(); setUser(null); navigate('/'); };

  useHotkeys({
    'mod+j': () => navigate('/chat'), 'mod+i': () => navigate('/receivables'),
    'mod+b': () => navigate('/payables'), 'mod+s': () => navigate('/settings'),
    'mod+d': () => navigate('/dashboard'), 'mod+t': () => navigate('/transactions'),
    'mod+p': () => navigate('/payroll'),
  });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let lastReset = 0;
    const reset = (e?: Event) => {
      const now = Date.now();
      if (e && now - lastReset < 2000) return;
      lastReset = now;
      if (timeout) clearTimeout(timeout);
      const dur = (authService.getCurrentUser()?.org.sessionTimeout || 30) * 60 * 1000;
      timeout = setTimeout(() => { if (authService.getCurrentUser()) { handleLogout(); showToast('Session expired.', 'info'); } }, dur);
    };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(n => document.addEventListener(n, reset));
    reset();
    return () => { events.forEach(n => document.removeEventListener(n, reset)); clearTimeout(timeout); };
  }, [user]);

  const userPlan = authService.getCurrentUser()?.org.plan || 'Free';
  const withUpgrade = (view: View, req: 'Growth' | 'Enterprise', title: string, desc: string, comp: React.ReactNode) => {
    if (!billingService.hasFeature(userPlan, view)) return (
      <div className="relative h-full">
        <UpgradeOverlay title={title} description={desc} requiredPlan={req} onUpgrade={() => navigate('/subscription')} />
        <div className="opacity-20 pointer-events-none blur-sm h-full overflow-hidden">{comp}</div>
      </div>
    );
    return comp;
  };

  const handlePayBill = (id: string) => {
    const bill = bills.bills.find(b => b.id === id);
    if (bill) {
      transactions.handleAddTransaction({ date: new Date().toISOString(), amount: bill.amount, narration: `Payment for bill #${id.slice(-4)} to ${bill.vendor}`, type: 'debit', category: 'Accounts Payable', projectId: bill.projectId });
    }
    bills.handlePayBill(id);
    showToast(`Bill marked as Paid.`, 'success');
  };

  const handleRecordInvoicePayment = (id: string) => {
    const inv = invoices.invoices.find(i => i.id === id);
    if (inv) {
      transactions.handleAddTransaction({ date: new Date().toISOString(), amount: inv.total, narration: `Payment received for invoice #${id.slice(-4)} from ${inv.customer}`, type: 'credit', category: 'Accounts Receivable', projectId: inv.projectId });
      inv.lineItems.forEach((li: any) => { if (li.inventoryItemId) updateStock(li.inventoryItemId, -li.quantity); });
      fetchInventoryItems().then(setInventory);
    }
    invoices.handleRecordPayment(id);
    showToast(`Invoice marked as Paid.`, 'success');
  };

  const handleConvertToBill = (po: PurchaseOrder) => {
    purchases.handleConvertToBill(po);
    bills.handleAddBill({ vendor: po.vendor, amount: po.total, description: `From PO #${po.id.slice(-4)}`, dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), whtApplies: false, lineItems: po.lineItems.map((l: any) => ({ ...l, description: l.name })), projectId: po.projectId });
    showToast(`PO converted to bill.`, 'success');
  };

  const handleConvertToInvoice = (est: Estimate) => {
    const sub = est.lineItems.reduce((s: number, i: any) => s + i.total, 0);
    const vat = sub * 0.075;
    purchases.handleConvertToInvoice(est);
    invoices.handleAddInvoice({ customer: est.customer, description: `From Estimate #${est.id.slice(-4)}`, amount: sub, vat, total: sub + vat, dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), whtApplied: false, lineItems: est.lineItems.map((l: any) => ({ ...l, description: l.name })), projectId: est.projectId });
    showToast(`Estimate converted to invoice.`, 'success');
  };

  const handleCloseYear = (year: number) => {
    const c = { id: `close_${year}`, year, status: 'Closed' as const, closedAt: new Date().toISOString(), closedBy: user?.name || 'Admin' };
    setClosingHistory(prev => [c, ...prev]);
    auditLogService.add(`Closed fiscal year ${year}`, user?.name || 'System', 'Accounting');
    showToast(`Fiscal year ${year} closed.`, 'success');
  };

  const renderView = (view: View) => {
    if (isLoading) return <div className="p-8">{view === 'dashboard' ? <DashboardSkeleton /> : <TableSkeleton />}</div>;
    if (error) return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <button onClick={loadInitialData} className="mt-6 px-4 py-2 bg-brand-pink text-white rounded-lg hover:bg-brand-pink/80">Retry</button>
        </div>
      </div>
    );

    const views: Record<View, React.ReactNode> = {
      dashboard: <Dashboard user={user} transactions={transactions.transactions} connections={useAppStore.getState().connections} bills={bills.bills} invoices={invoices.invoices} onQuickAction={setActiveView} onAddTransaction={transactions.handleAddTransaction} />,
      transactions: <TransactionsView transactions={transactions.transactions} onUpdateCategory={transactions.handleUpdateTransaction} onAddTransaction={transactions.handleAddTransaction} projects={projects.projects} chartOfAccounts={chartOfAccounts} />,
      reports: <FinancialReportsView transactions={transactions.transactions} payrollSummary={payroll.payrollSummary} bills={bills.bills} invoices={invoices.invoices} inventory={inventory.inventory} projects={projects.projects} chartOfAccounts={chartOfAccounts} />,
      payables: <PayablesView bills={bills.bills} onAddBill={bills.handleAddBill} onPayBill={handlePayBill} inventoryItems={inventory.inventory} />,
      receivables: <ReceivablesView invoices={invoices.invoices} onAddInvoice={invoices.handleAddInvoice} onRecordPayment={handleRecordInvoicePayment} inventoryItems={inventory.inventory} />,
      estimates: <EstimatesView estimates={purchases.estimates} onAddEstimate={purchases.handleAddEstimate} onConvertToInvoice={handleConvertToInvoice} inventoryItems={inventory.inventory} />,
      purchaseOrders: <PurchaseOrdersView purchaseOrders={purchases.purchaseOrders} onAddPurchaseOrder={purchases.handleAddPO} onConvertToBill={handleConvertToBill} inventoryItems={inventory.inventory} />,
      payroll: <PayrollView employees={payroll.employees} payrollSummary={payroll.payrollSummary} payrollHistory={payroll.payrollHistory} onAddEmployee={payroll.handleAddEmployee} onUpdateEmployee={payroll.handleUpdateEmployee} onRemoveEmployee={payroll.handleRemoveEmployee} onRunPayroll={payroll.handleRunPayroll} />,
      inventory: <InventoryView items={inventory.inventory} onAddItem={inventory.handleAdd} onUpdateItem={inventory.handleUpdate} />,
      contacts: <ContactsView contacts={contactsHook.contacts} invoices={invoices.invoices} bills={bills.bills} onAddContact={contactsHook.handleAdd} onUpdateContact={contactsHook.handleUpdate} />,
      taxFiling: <TaxFilingView transactions={transactions.transactions} />,
      connections: <ConnectionsView onConnectionsUpdated={loadInitialData} />,
      integrations: <IntegrationsView />,
      chartOfAccounts: <ChartOfAccountsView accounts={chartOfAccounts} setAccounts={setChartOfAccounts} />,
      journalEntries: <JournalEntriesView entries={journalEntries.journalEntries} onAddEntry={journalEntries.handleAdd} accounts={chartOfAccounts} />,
      budgeting: <BudgetingView budgets={budgetsHook.budgets} onSaveBudgets={budgetsHook.handleSave} expenseCategories={chartOfAccounts.filter(a => a.type === 'Expense').map(a => a.name)} />,
      auditTrail: <AuditTrailView logs={useAppStore.getState().auditLog} />,
      projects: <ProjectsView projects={projects.projects} transactions={transactions.transactions} onAddProject={projects.handleAdd} />,
      settings: <SettingsView />,
      subscription: <SubscriptionView />,
      chat: <AIChat transactions={transactions.transactions} invoices={invoices.invoices} bills={bills.bills} />,
      fixedAssets: <FixedAssetsView assets={assets.fixedAssets} onAddAsset={assets.handleAdd} onDisposeAsset={assets.handleDispose} />,
      reconciliation: <BankReconciliationView connections={useAppStore.getState().connections} transactions={transactions.transactions} />,
      recurring: <RecurringTransactionsView invoices={invoices.invoices} bills={bills.bills} />,
      yearEnd: <YearEndClosingView history={closingHistory} onCloseYear={handleCloseYear} />,
      privacy: <LegalView type="privacy" />,
      terms: <LegalView type="terms" />,
      blog: <div />, about: <div />, careers: <div />, contact: <div />, security: <div />,
    };

    return (
      <Suspense fallback={<div className="p-8">{view === 'dashboard' ? <DashboardSkeleton /> : <TableSkeleton />}</div>}>
        {views[view] || views.dashboard}
      </Suspense>
    );
  };

  if (!user) {
    if (legalType) return (
      <div className="bg-dark-primary min-h-screen">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLegalType(null)}>
            <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <span className="text-xl font-black tracking-tighter">AURA</span>
          </div>
          <button onClick={() => setLegalType(null)} className="text-sm font-bold text-brand-cyan hover:underline">Back</button>
        </nav>
        <div className="pt-10"><LegalView type={legalType} /></div>
      </div>
    );
    if (showAuth) return (
      <div className="relative">
        <button onClick={() => setShowAuth(false)} className="absolute top-8 left-8 z-[100] text-gray-400 hover:text-white flex items-center gap-2 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back
        </button>
        <AuthView onLogin={handleLogin} />
      </div>
    );
    return <LandingView onGetStarted={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} onNavigate={(v) => navigate(`/${v}`)} />;
  }

  return (
    <div className={`flex h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-dark-primary text-white dark' : 'bg-light-primary text-aura-gray-900 light'} ${highContrast ? 'high-contrast' : ''}`}>
      <OnboardingTour />
      <CommandPalette />
      <Sidebar activeView={activeView} setActiveView={(v) => navigate(`/${v}`)} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header user={user} />
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 rounded-tl-[2.5rem] ${theme === 'dark' ? 'bg-dark-secondary/30 border-white/5' : 'bg-white border-aura-gray-200 shadow-2xl'} backdrop-blur-sm border-t border-l relative`}>
          {theme === 'dark' && <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[128px] pointer-events-none -z-10 opacity-50" />}
          <Routes>
            <Route path="/shared/*" element={<Suspense fallback={<div className="h-screen flex items-center justify-center bg-dark-primary"><Spinner /></div>}><SharedReportView /></Suspense>} />
            <Route path="/:view" element={<ViewWrapper renderView={renderView} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const ViewWrapper = ({ renderView }: { renderView: (view: View) => React.ReactNode }) => {
  const { view } = useParams<{ view: string }>();
  return <>{renderView(view as View)}</>;
};
