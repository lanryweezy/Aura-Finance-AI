
export interface RawTransaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  date: string;
  narration: string;
  balance?: number;
  currency?: string;
  exchangeRate?: number;
}

export interface CategorizedTransaction extends RawTransaction {
  category: string;
  projectId?: string;
  receiptUrl?: string;
  entityId?: string;
}

export interface ReceiptData {
    merchantName: string;
    date: string;
    totalAmount: number;
    category: string;
    description: string;
}

export interface FinancialInsight {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface LineItem {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    inventoryItemId?: string; // Link to inventory
}

export interface Bill {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
  whtApplies: boolean;
  lineItems: LineItem[];
  projectId?: string;
  currency?: string;
  exchangeRate?: number;
  isRecurring?: boolean;
  recurringSchedule?: RecurringSchedule;
  entityId?: string;
}

export interface Invoice {
  id:string;
  customer: string;
  description: string;
  amount: number; // Subtotal
  vat: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
  whtApplied: boolean;
  lineItems: LineItem[];
  projectId?: string;
  currency?: string;
  exchangeRate?: number;
  isRecurring?: boolean;
  recurringSchedule?: RecurringSchedule;
  entityId?: string;
}

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  hireDate: string;
  email: string;
  bankName: string;
  accountNumber: string;
  grossSalary: number;
  entityId?: string;
}

export interface PayrollSummary {
    totalGross: number;
    totalPAYE: number;
    totalPension: number;
    totalNHF: number;
    totalNet: number;
    employeeCount: number;
}

export interface PayrollAdjustment {
  bonus: number;
  deduction: number;
}

export interface PayrollPayslip {
    employeeId: string;
    employeeName: string;
    grossSalary: number;
    bonus: number;
    deduction: number;
    totalIncome: number;
    paye: number;
    pension: number;
    nhf: number;
    totalDeductions: number;
    netSalary: number;
}

export interface PayrollRun {
    id: string;
    runDate: string;
    period: string;
    summary: {
        employeeCount: number;
        totalGross: number;
        totalBonuses: number;
        totalDeductions: number;
        totalNet: number;
        totalPAYE: number;
        totalPension: number;
    };
    payslips: PayrollPayslip[];
    entityId?: string;
}


export interface BankConnection {
  id: string;
  provider: 'mono' | 'okra';
  bankName: string;
  accountNumber: string;
  accountName: string;
  lastSynced: string;
  currency?: string;
  balance?: number;
}

// ============== NEW CORE ACCOUNTING TYPES ==============
export interface Account {
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    description?: string;
    code?: string;
}

export interface JournalLine {
    accountName: string;
    type: 'debit' | 'credit';
    amount: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    narration: string;
    lines: JournalLine[];
    entityId?: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    manager?: string;
    status: 'Active' | 'Completed' | 'On Hold';
    entityId?: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    module?: string;
}

export interface Budget {
    category: string;
    amount: number; // Monthly budget amount
    entityId?: string;
}

// ============== NEW SALES/PURCHASING/INVENTORY TYPES ==============
export interface PurchaseOrder {
    id: string;
    vendor: string;
    issueDate: string;
    expectedDeliveryDate: string;
    status: 'Draft' | 'Sent' | 'Completed' | 'Cancelled';
    lineItems: LineItem[];
    total: number;
    projectId?: string;
    entityId?: string;
}

export interface Estimate {
    id: string;
    customer: string;
    issueDate: string;
    expiryDate: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
    lineItems: LineItem[];
    total: number;
    projectId?: string;
    entityId?: string;
}

export interface StockLot {
    id: string;
    purchaseDate: string;
    quantity: number;
    unitCost: number;
    warehouseId?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    category: string;
    type: 'Product' | 'Service';
    costPrice: number; // For COGS (average or current)
    salePrice: number;
    quantity: number; // Total quantity
    lots?: StockLot[]; // For FIFO/LIFO tracking
    valuationMethod: 'FIFO' | 'LIFO' | 'Average';
    warehouseBalances?: Record<string, number>; // warehouseId -> quantity
    lowStockThreshold?: number;
    entityId?: string;
}

export interface Warehouse {
    id: string;
    name: string;
    location: string;
    entityId?: string;
}

// ============== FIXED ASSETS ==============
export interface FixedAsset {
    id: string;
    name: string;
    category: string;
    purchaseDate: string;
    purchaseCost: number;
    salvageValue: number;
    usefulLifeYears: number;
    depreciationMethod: 'Straight Line' | 'Declining Balance';
    status: 'Active' | 'Disposed';
    disposalDate?: string;
    disposalPrice?: number;
    accumulatedDepreciation: number;
    bookValue: number;
    entityId?: string;
}

// ============== BANK RECONCILIATION ==============
export interface BankReconciliation {
    id: string;
    bankAccountId: string;
    statementDate: string;
    statementEndingBalance: number;
    clearedTransactions: string[]; // IDs
    isCompleted: boolean;
    entityId?: string;
}

// ============== RECURRING ==============
export interface RecurringSchedule {
    frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    startDate: string;
    nextOccurrence: string;
    endAfterOccurrences?: number;
    occurrencesCount: number;
}

// ============== MULTI-ENTITY ==============
export interface Entity {
    id: string;
    name: string;
    type: 'Subsidiary' | 'Branch' | 'Department' | 'Main';
    taxId?: string;
    currency: string;
    isMain: boolean;
}

// ============== YEAR-END CLOSING ==============
export interface ClosingPeriod {
    id: string;
    year: number;
    status: 'Draft' | 'Closed';
    closedAt?: string;
    closedBy?: string;
    entityId?: string;
}

// ============== CRM TYPES ==============
export interface Contact {
    id: string;
    type: 'Customer' | 'Vendor';
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address?: string;
    tin?: string; // Tax Identification Number
}

// ============== SAAS & AUTH TYPES ==============
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Viewer';
    organizationId: string;
    avatarUrl?: string;
    currentEntityId?: string;
}

export interface Organization {
    id: string;
    name: string;
    plan: 'Free' | 'Growth' | 'Enterprise';
    tin?: string;
    twoFactorEnabled?: boolean;
    ipWhitelist?: string[];
    sessionTimeout?: number; // in minutes
    encryptionEnabled?: boolean;
    entities?: Entity[];
}

export interface ApiKey {
    id: string;
    key: string;
    name: string;
    scope: 'read' | 'write' | 'admin';
    createdAt: string;
    lastUsed?: string;
}

export interface SubscriptionTier {
    id: 'Free' | 'Growth' | 'Enterprise';
    name: string;
    price: number;
    features: string[];
    highlighted?: boolean;
}


export type View = 
    'dashboard' | 'transactions' | 'chat' | 'connections' | 'integrations' | 'taxFiling' | 'reports' |
    'receivables' | 'payables' | 'payroll' |
    // New Views
    'chartOfAccounts' | 'journalEntries' | 'purchaseOrders' | 'estimates' | 'inventory' |
    'budgeting' | 'auditTrail' | 'projects' | 'settings' | 'subscription' | 'contacts' |
    'privacy' | 'terms' | 'blog' | 'about' | 'careers' | 'contact' | 'security' |
    // Core Enhancements
    'fixedAssets' | 'reconciliation' | 'recurring' | 'yearEnd';

// Financial Report Types
export interface ReportPeriod {
  start: Date;
  end: Date;
}

export interface PandLData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  expensesByCategory: Record<string, number>;
  totalExpenses: number;
  netOperatingIncome: number;
  netProfit: number;
}

export interface BalanceSheetData {
  cashAndBank: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  accountsPayable: number;
  totalCurrentLiabilities: number;
  equity: number;
  currentRatio: number;
}

export interface CashFlowData {
    netProfit: number;
    changeInReceivables: number;
    changeInPayables: number;
    cashFromOperating: number;
    ownersDraw: number;
    cashFromFinancing: number;
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
}

export interface ReportData {
  pAndL: PandLData;
  balanceSheet: BalanceSheetData;
  cashFlow: CashFlowData;
}
