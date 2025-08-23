
import React from 'react';
import type { View } from './types';

export interface NavItem {
    id: View;
    label: string;
    icon: React.ReactNode;
    children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'AI Assistant',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    ),
  },
  {
    id: 'receivables', // Parent ID
    label: 'Sales & Income',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/>
            <path d="M12 11v7"/><path d="m15 15-3 3-3-3"/>
        </svg>
    ),
    children: [
        { id: 'estimates', label: 'Quotes & Estimates', icon: <></> },
        { id: 'receivables', label: 'Invoices', icon: <></> },
    ],
  },
  {
    id: 'payables', // Parent ID
    label: 'Bills & Expenses',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Z"/>
            <path d="M12 4v7"/><path d="m15 8-3-3-3 3"/>
        </svg>
    ),
    children: [
        { id: 'payables', label: 'Bills & Payables', icon: <></> },
        { id: 'purchase-orders', label: 'Purchase Orders', icon: <></> },
    ],
  },
  {
    id: 'transactions',
    label: 'Bank Transactions',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 21h10" />
            <path d="M10 21v-8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8" />
            <path d="M22 21v-8a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v8" />
            <path d="M7 10H2v11" />
            <path d="M22 10h-5v11" />
            <path d="M14 10h-4v11" />
            <path d="M2 10l10-8 10 8" />
        </svg>
    ),
  },
  {
    id: 'payroll',
    label: 'Payroll & Staff',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m22 2-3 10h-5l-3-10" />
            <circle cx="18" cy="5" r="2" />
        </svg>
    ),
  },
  {
    id: 'tax-filing',
    label: 'Tax & Compliance',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
        </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
        </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory & Stock',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    ),
  },
  {
    id: 'accounting', // Parent ID
    label: 'Accounting & Books',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M9 10h6" />
            <path d="M9 14h6" />
        </svg>
    ),
    children: [
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: <></> },
        { id: 'journal-entries', label: 'Journal Entries', icon: <></> },
        { id: 'budgeting', label: 'Budget Planning', icon: <></> },
        { id: 'audit-trail', label: 'Audit Trail', icon: <></> },
    ],
  },
  {
    id: 'integrations', // Parent ID
    label: 'Connections & Settings',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    children: [
        { id: 'connections', label: 'Bank Connections', icon: <></> },
        { id: 'integrations', label: 'App Integrations', icon: <></> },
        { id: 'ai-settings', label: 'AI Automation', icon: <></> },
    ],
  },
  {
    id: 'ai-automation',
    label: 'AI Dashboard',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    ),
  },
];

// Nigerian VAT and Tax Constants
export const NIGERIAN_TAX_RATES = {
    VAT: 0.075, // 7.5%
    WHT_SERVICES: 0.05, // 5% for professional services
    WHT_CONSTRUCTION: 0.05, // 5% for construction
    WHT_CONSULTANCY: 0.10, // 10% for consultancy
    WHT_RENT: 0.10, // 10% for rent
    COMPANY_INCOME_TAX: 0.30, // 30% for large companies
    SMALL_COMPANY_TAX: 0.20, // 20% for small companies
    STAMP_DUTY: 0.0075, // 0.75% for certain transactions
};

// Nigerian Banking Information
export const NIGERIAN_BANKS = [
    { code: '044', name: 'Access Bank' },
    { code: '014', name: 'Afribank Nigeria Plc' },
    { code: '023', name: 'Citibank Nigeria Limited' },
    { code: '063', name: 'Diamond Bank' },
    { code: '050', name: 'Ecobank Nigeria Plc' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '076', name: 'Polaris Bank' },
];

// Common Nigerian Business Expense Categories
export const NIGERIAN_EXPENSE_CATEGORIES = [
    'Office Rent',
    'Utilities (NEPA/Electricity)',
    'Generator Fuel & Maintenance',
    'Internet & Communication',
    'Transportation & Logistics',
    'Professional Services',
    'Bank Charges',
    'Government Levies & Permits',
    'Security Services',
    'Cleaning & Maintenance',
    'Staff Welfare',
    'Training & Development',
    'Marketing & Advertising',
    'Insurance',
    'Equipment & Supplies',
];

// Nigerian Business Compliance Reminders
export const COMPLIANCE_DEADLINES = {
    MONTHLY: [
        { name: 'VAT Returns', deadline: '21st of following month' },
        { name: 'WHT Returns', deadline: '21st of following month' },
        { name: 'PAYE Remittance', deadline: '10th of following month' },
    ],
    QUARTERLY: [
        { name: 'Company Income Tax', deadline: 'Within 3 months of quarter end' },
    ],
    ANNUALLY: [
        { name: 'Annual Returns (CAC)', deadline: 'Within 42 days of AGM' },
        { name: 'Audited Financial Statements', deadline: 'Within 42 days of AGM' },
        { name: 'Tax Clearance Certificate', deadline: 'Before March 31st' },
    ],
};
