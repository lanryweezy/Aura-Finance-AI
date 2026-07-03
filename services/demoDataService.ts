/**
 * Aura Finance AI — Demo Data
 * Realistic Nigerian business data for instant product experience.
 * No Supabase, no API keys, no signup required.
 */

import type { CategorizedTransaction, Invoice, Bill, Employee, Contact, Project, Budget, CorporateCard, ApprovalRequest } from '../types';

// ============== Nigerian Business Profiles ==============
const DEMO_BUSINESS = {
  name: 'TechFlow Lagos',
  email: 'admin@techflow.ng',
  plan: 'Enterprise' as const,
  industry: 'Technology',
  employees: 12,
};

// ============== Transactions (6 months of realistic data) ==============
function generateTransactions(): CategorizedTransaction[] {
  const now = new Date();
  const transactions: CategorizedTransaction[] = [];
  const narrations = [
    { text: 'PAYSTACK/INVOICE-CLIENT-A', type: 'credit' as const, category: 'Sales Revenue', amount: 750000 },
    { text: 'NIP/UBA-SENIOR-DEV-SALARY', type: 'debit' as const, category: 'Salaries & Wages', amount: 450000 },
    { text: 'NIP/UBA-PRODUCT-MGR-SALARY', type: 'debit' as const, category: 'Salaries & Wages', amount: 380000 },
    { text: 'GOOGLE ADS-CAMPAIGN', type: 'debit' as const, category: 'Marketing & Advertising', amount: 125000 },
    { text: 'JUMIA/OFFICE-CHAIR', type: 'debit' as const, category: 'Office Supplies', amount: 45000 },
    { text: 'IKEJA-ELECTRICITY-BILL', type: 'debit' as const, category: 'Utilities', amount: 35000 },
    { text: 'FLUTTERWAVE/CLIENT-B-PAYMENT', type: 'credit' as const, category: 'Sales Revenue', amount: 1200000 },
    { text: 'NIP/UBA-DESIGNER-SALARY', type: 'debit' as const, category: 'Salaries & Wages', amount: 280000 },
    { text: 'SUBSCRIPTION/SLACK-TEAM', type: 'debit' as const, category: 'Software & Subscriptions', amount: 25000 },
    { text: 'SUBSCRIPTION/GITHUB-TEAM', type: 'debit' as const, category: 'Software & Subscriptions', amount: 18000 },
    { text: 'SUBSCRIPTION/VERCEL-PRO', type: 'debit' as const, category: 'Software & Subscriptions', amount: 12000 },
    { text: 'NIP/UBA-JUNIOR-DEV-SALARY', type: 'debit' as const, category: 'Salaries & Wages', amount: 220000 },
    { text: 'PAYSTACK/INVOICE-CLIENT-C', type: 'credit' as const, category: 'Sales Revenue', amount: 500000 },
    { text: 'GTBANK/SERVICE-CHARGE', type: 'debit' as const, category: 'Bank Charges & Fees', amount: 3500 },
    { text: 'UBER/RIDE-TO-CLIENT', type: 'debit' as const, category: 'Travel', amount: 4500 },
    { text: 'BOLT/RIDE-TO-OFFICE', type: 'debit' as const, category: 'Travel', amount: 2800 },
    { text: 'RESTAURANT/CLIENT-LUNCH', type: 'debit' as const, category: 'Meals & Entertainment', amount: 28000 },
    { text: 'NIP/UBA-INTERN-SALARY', type: 'debit' as const, category: 'Salaries & Wages', amount: 120000 },
    { text: 'FLUTTERWAVE/CLIENT-D-PAYMENT', type: 'credit' as const, category: 'Sales Revenue', amount: 950000 },
    { text: 'OFFICE-RENT-Q1', type: 'debit' as const, category: 'Rent & Leases', amount: 600000 },
  ];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    for (const n of narrations) {
      const dayOffset = Math.floor(Math.random() * 28) + 1;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayOffset);
      const variance = 0.9 + Math.random() * 0.2;

      transactions.push({
        id: `txn_${monthOffset}_${Math.random().toString(36).slice(2, 8)}`,
        amount: Math.round(n.amount * variance),
        type: n.type,
        date: date.toISOString(),
        narration: n.text,
        balance: 0,
        category: n.category,
      });
    }
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate running balance
  let balance = 5000000;
  transactions.forEach(t => {
    balance = t.type === 'credit' ? balance + t.amount : balance - t.amount;
    t.balance = balance;
  });

  return transactions;
}

// ============== Invoices ==============
const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv_demo_1', customer: 'TechCorp Solutions', description: 'Website Redesign Project',
    amount: 2500000, vat: 187500, total: 2687500,
    issueDate: '2026-06-01T00:00:00Z', dueDate: '2026-07-01T00:00:00Z',
    status: 'Unpaid', whtApplied: false,
    lineItems: [{ id: 'li1', name: 'Website Design', description: 'Full redesign', quantity: 1, unitPrice: 1500000, total: 1500000 }, { id: 'li2', name: 'Development', description: 'React frontend', quantity: 1, unitPrice: 1000000, total: 1000000 }],
    currency: 'NGN',
  },
  {
    id: 'inv_demo_2', customer: 'GreenLeaf Consulting', description: 'Monthly Retainer - June',
    amount: 500000, vat: 37500, total: 537500,
    issueDate: '2026-06-15T00:00:00Z', dueDate: '2026-07-15T00:00:00Z',
    status: 'Paid', whtApplied: false,
    lineItems: [{ id: 'li3', name: 'Consulting Services', description: 'Monthly retainer', quantity: 1, unitPrice: 500000, total: 500000 }],
    currency: 'NGN',
  },
  {
    id: 'inv_demo_3', customer: 'StyleHub Fashion', description: 'E-commerce Integration',
    amount: 800000, vat: 60000, total: 860000,
    issueDate: '2026-05-20T00:00:00Z', dueDate: '2026-06-20T00:00:00Z',
    status: 'Overdue', whtApplied: false,
    lineItems: [{ id: 'li4', name: 'Shopify Integration', description: 'Full e-commerce setup', quantity: 1, unitPrice: 800000, total: 800000 }],
    currency: 'NGN',
  },
  {
    id: 'inv_demo_4', customer: 'StartupHub Lagos', description: 'Mobile App Development',
    amount: 3500000, vat: 262500, total: 3762500,
    issueDate: '2026-04-01T00:00:00Z', dueDate: '2026-05-01T00:00:00Z',
    status: 'Paid', whtApplied: false,
    lineItems: [{ id: 'li5', name: 'App Development', description: 'React Native app', quantity: 1, unitPrice: 2500000, total: 2500000 }, { id: 'li6', name: 'UI/UX Design', description: 'Figma designs', quantity: 1, unitPrice: 1000000, total: 1000000 }],
    currency: 'NGN',
  },
  {
    id: 'inv_demo_5', customer: 'FinTech Startup', description: 'API Development',
    amount: 1800000, vat: 135000, total: 1935000,
    issueDate: '2026-06-10T00:00:00Z', dueDate: '2026-07-10T00:00:00Z',
    status: 'Unpaid', whtApplied: false,
    lineItems: [{ id: 'li7', name: 'Backend API', description: 'REST API development', quantity: 1, unitPrice: 1200000, total: 1200000 }, { id: 'li8', name: 'Documentation', description: 'API docs + SDK', quantity: 1, unitPrice: 600000, total: 600000 }],
    currency: 'NGN',
  },
];

// ============== Bills ==============
const DEMO_BILLS: Bill[] = [
  { id: 'bill_demo_1', vendor: 'AWS', description: 'Cloud Infrastructure - June', amount: 185000, issueDate: '2026-06-01T00:00:00Z', dueDate: '2026-07-01T00:00:00Z', status: 'Unpaid', whtApplies: false, lineItems: [], currency: 'NGN' },
  { id: 'bill_demo_2', vendor: 'Google Cloud', description: 'Domain & Email Services', amount: 45000, issueDate: '2026-06-05T00:00:00Z', dueDate: '2026-07-05T00:00:00Z', status: 'Unpaid', whtApplies: false, lineItems: [], currency: 'NGN' },
  { id: 'bill_demo_3', vendor: 'Office Landlord', description: 'Q2 Office Rent', amount: 600000, issueDate: '2026-04-01T00:00:00Z', dueDate: '2026-04-01T00:00:00Z', status: 'Paid', whtApplies: true, lineItems: [], currency: 'NGN' },
  { id: 'bill_demo_4', vendor: 'IKEJA Electric', description: 'Electricity - June', amount: 35000, issueDate: '2026-06-15T00:00:00Z', dueDate: '2026-07-15T00:00:00Z', status: 'Unpaid', whtApplies: false, lineItems: [], currency: 'NGN' },
  { id: 'bill_demo_5', vendor: 'MTN Nigeria', description: 'Internet & Airtime', amount: 28000, issueDate: '2026-06-10T00:00:00Z', dueDate: '2026-07-10T00:00:00Z', status: 'Paid', whtApplies: false, lineItems: [], currency: 'NGN' },
];

// ============== Employees ==============
const DEMO_EMPLOYEES: Employee[] = [
  { id: 'emp_demo_1', name: 'Ada Okoro', jobTitle: 'Lead Developer', hireDate: '2022-05-15T00:00:00Z', email: 'ada.okoro@techflow.ng', bankName: 'GTBank', accountNumber: '0123456789', grossSalary: 450000 },
  { id: 'emp_demo_2', name: 'Bolu Adebayo', jobTitle: 'Product Manager', hireDate: '2021-11-20T00:00:00Z', email: 'bolu.adebayo@techflow.ng', bankName: 'Kuda Bank', accountNumber: '0987654321', grossSalary: 380000 },
  { id: 'emp_demo_3', name: 'Chidi Eze', jobTitle: 'Junior Developer', hireDate: '2023-08-01T00:00:00Z', email: 'chidi.eze@techflow.ng', bankName: 'Access Bank', accountNumber: '1122334455', grossSalary: 220000 },
  { id: 'emp_demo_4', name: 'Funke Williams', jobTitle: 'COO', hireDate: '2020-02-10T00:00:00Z', email: 'funke.williams@techflow.ng', bankName: 'Zenith Bank', accountNumber: '5566778899', grossSalary: 800000 },
  { id: 'emp_demo_5', name: 'Tunde Okafor', jobTitle: 'DevOps Engineer', hireDate: '2023-01-15T00:00:00Z', email: 'tunde.okafor@techflow.ng', bankName: 'GTBank', accountNumber: '3344556677', grossSalary: 350000 },
];

// ============== Contacts ==============
const DEMO_CONTACTS: Contact[] = [
  { id: 'cont_demo_1', type: 'Customer', name: 'TechCorp Solutions', companyName: 'TechCorp Ltd', email: 'accounts@techcorp.ng' },
  { id: 'cont_demo_2', type: 'Customer', name: 'GreenLeaf Consulting', companyName: 'GreenLeaf Inc', email: 'finance@greenleaf.ng' },
  { id: 'cont_demo_3', type: 'Customer', name: 'StyleHub Fashion', companyName: 'StyleHub', email: 'pay@stylehub.ng' },
  { id: 'cont_demo_4', type: 'Customer', name: 'StartupHub Lagos', companyName: 'StartupHub', email: 'billing@startuphub.ng' },
  { id: 'cont_demo_5', type: 'Vendor', name: 'AWS Nigeria', companyName: 'Amazon Web Services', email: 'billing@aws.ng' },
  { id: 'cont_demo_6', type: 'Vendor', name: 'Google Cloud', companyName: 'Google', email: 'cloud-billing@google.com' },
  { id: 'cont_demo_7', type: 'Vendor', name: 'Office Landlord', companyName: 'Lagos Properties', email: 'rent@lagosprops.ng' },
];

// ============== Projects ==============
const DEMO_PROJECTS: Project[] = [
  { id: 'proj_demo_1', name: 'Website Redesign', description: 'TechCorp website overhaul', budget: 3000000, status: 'Active', startDate: '2026-04-01T00:00:00Z' },
  { id: 'proj_demo_2', name: 'E-commerce Integration', description: 'StyleHub Shopify setup', budget: 1000000, status: 'Completed', startDate: '2026-03-01T00:00:00Z', endDate: '2026-05-20T00:00:00Z' },
  { id: 'proj_demo_3', name: 'Mobile App', description: 'StartupHub React Native app', budget: 4000000, status: 'Active', startDate: '2026-04-01T00:00:00Z' },
];

// ============== Budgets ==============
const DEMO_BUDGETS: Budget[] = [
  { category: 'Salaries & Wages', amount: 2500000 },
  { category: 'Office Supplies', amount: 100000 },
  { category: 'Marketing & Advertising', amount: 200000 },
  { category: 'Software & Subscriptions', amount: 80000 },
  { category: 'Travel', amount: 50000 },
  { category: 'Utilities', amount: 60000 },
  { category: 'Rent & Leases', amount: 600000 },
  { category: 'Meals & Entertainment', amount: 100000 },
];

// ============== Demo Load Function ==============
export function loadDemoData() {
  const transactions = generateTransactions();

  localStorage.setItem('aura_user', JSON.stringify({
    id: 'u_demo', name: 'Demo User', email: 'demo@aura.ai',
    role: 'Owner', organizationId: 'org_demo',
  }));
  localStorage.setItem('aura_org', JSON.stringify({
    id: 'org_demo', name: DEMO_BUSINESS.name, plan: 'Enterprise',
  }));

  return { transactions, invoices: DEMO_INVOICES, bills: DEMO_BILLS, employees: DEMO_EMPLOYEES, contacts: DEMO_CONTACTS, projects: DEMO_PROJECTS, budgets: DEMO_BUDGETS };
}

export function isDemoMode(): boolean {
  return localStorage.getItem('aura_org')?.includes('org_demo') || false;
}

export function exitDemoMode() {
  localStorage.removeItem('aura_user');
  localStorage.removeItem('aura_org');
  localStorage.removeItem('aura_token');
  localStorage.removeItem('aura_theme');
}
