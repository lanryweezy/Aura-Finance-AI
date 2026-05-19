import { create } from 'zustand';
import { View, User, CategorizedTransaction, Employee, BankConnection, Bill, Invoice, PayrollRun, Account, JournalEntry, Project, InventoryItem, PurchaseOrder, Estimate, Budget, Contact } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/accounting';
import { auditLogService } from '../services/auditLogService';

interface AppState {
    user: User | null;
    activeView: View;
    transactions: CategorizedTransaction[];
    employees: Employee[];
    connections: BankConnection[];
    bills: Bill[];
    invoices: Invoice[];
    payrollHistory: PayrollRun[];
    chartOfAccounts: Account[];
    journalEntries: JournalEntry[];
    projects: Project[];
    inventory: InventoryItem[];
    purchaseOrders: PurchaseOrder[];
    estimates: Estimate[];
    budgets: Budget[];
    contacts: Contact[];
    auditLog: any[];
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
    isConsolidatedMode: boolean;
    subsidiaries: { id: string, name: string }[];

    setUser: (user: User | null) => void;
    setActiveView: (view: View) => void;
    setTransactions: (transactions: CategorizedTransaction[] | ((prev: CategorizedTransaction[]) => CategorizedTransaction[])) => void;
    setEmployees: (employees: Employee[] | ((prev: Employee[]) => Employee[])) => void;
    setConnections: (connections: BankConnection[]) => void;
    setBills: (bills: Bill[] | ((prev: Bill[]) => Bill[])) => void;
    setInvoices: (invoices: Invoice[] | ((prev: Invoice[]) => Invoice[])) => void;
    setPayrollHistory: (history: PayrollRun[] | ((prev: PayrollRun[]) => PayrollRun[])) => void;
    setChartOfAccounts: (accounts: Account[] | ((prev: Account[]) => Account[])) => void;
    setJournalEntries: (entries: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => void;
    setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;
    setInventory: (inventory: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void;
    setPurchaseOrders: (purchaseOrders: PurchaseOrder[] | ((prev: PurchaseOrder[]) => PurchaseOrder[])) => void;
    setEstimates: (estimates: Estimate[] | ((prev: Estimate[]) => Estimate[])) => void;
    setBudgets: (budgets: Budget[] | ((prev: Budget[]) => Budget[])) => void;
    setContacts: (contacts: Contact[] | ((prev: Contact[]) => Contact[])) => void;
    setAuditLog: (logs: any[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setConsolidatedMode: (enabled: boolean) => void;
    setSubsidiaries: (subsidiaries: { id: string, name: string }[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    user: null,
    activeView: 'dashboard',
    transactions: [],
    employees: [],
    connections: [],
    bills: [],
    invoices: [],
    payrollHistory: [],
    chartOfAccounts: DEFAULT_CATEGORIES,
    journalEntries: [],
    projects: [],
    inventory: [],
    purchaseOrders: [],
    estimates: [],
    budgets: [],
    contacts: [],
    auditLog: auditLogService.getLogs(),
    isLoading: true,
    error: null,
    theme: (localStorage.getItem('aura_theme') as 'light' | 'dark') || 'dark',
    isConsolidatedMode: false,
    subsidiaries: [
        { id: 'sub_1', name: 'Aura Logistics South' },
        { id: 'sub_2', name: 'Aura Manufacturing' }
    ],

    setUser: (user) => set({ user }),
    setActiveView: (activeView) => set({ activeView }),
    setTransactions: (updater) => set((state) => ({ transactions: typeof updater === 'function' ? updater(state.transactions) : updater })),
    setEmployees: (updater) => set((state) => ({ employees: typeof updater === 'function' ? updater(state.employees) : updater })),
    setConnections: (connections) => set({ connections }),
    setBills: (updater) => set((state) => ({ bills: typeof updater === 'function' ? updater(state.bills) : updater })),
    setInvoices: (updater) => set((state) => ({ invoices: typeof updater === 'function' ? updater(state.invoices) : updater })),
    setPayrollHistory: (updater) => set((state) => ({ payrollHistory: typeof updater === 'function' ? updater(state.payrollHistory) : updater })),
    setChartOfAccounts: (updater) => set((state) => ({ chartOfAccounts: typeof updater === 'function' ? updater(state.chartOfAccounts) : updater })),
    setJournalEntries: (updater) => set((state) => ({ journalEntries: typeof updater === 'function' ? updater(state.journalEntries) : updater })),
    setProjects: (updater) => set((state) => ({ projects: typeof updater === 'function' ? updater(state.projects) : updater })),
    setInventory: (updater) => set((state) => ({ inventory: typeof updater === 'function' ? updater(state.inventory) : updater })),
    setPurchaseOrders: (updater) => set((state) => ({ purchaseOrders: typeof updater === 'function' ? updater(state.purchaseOrders) : updater })),
    setEstimates: (updater) => set((state) => ({ estimates: typeof updater === 'function' ? updater(state.estimates) : updater })),
    setBudgets: (updater) => set((state) => ({ budgets: typeof updater === 'function' ? updater(state.budgets) : updater })),
    setContacts: (updater) => set((state) => ({ contacts: typeof updater === 'function' ? updater(state.contacts) : updater })),
    setAuditLog: (auditLog) => set({ auditLog }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setTheme: (theme) => {
        localStorage.setItem('aura_theme', theme);
        set({ theme });
    },
    setConsolidatedMode: (isConsolidatedMode) => set({ isConsolidatedMode }),
    setSubsidiaries: (subsidiaries) => set({ subsidiaries }),
}));
