
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
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'O-Heidi AI',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    label: 'Sales',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/>
            <path d="M12 11v7"/><path d="m15 15-3 3-3-3"/>
        </svg>
    ),
    children: [
        { id: 'estimates', label: 'Estimates', icon: <></> },
        { id: 'receivables', label: 'Invoices', icon: <></> },
    ]
  },
  {
    id: 'payables', // Parent ID
    label: 'Purchases',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Z"/>
            <path d="M12 4v7"/><path d="m15 8-3-3-3 3"/>
        </svg>
    ),
    children: [
        { id: 'purchaseOrders', label: 'Purchase Orders', icon: <></> },
        { id: 'payables', label: 'Bills', icon: <></> },
        { id: 'inventory', label: 'Products & Services', icon: <></> },
    ]
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <path d="M17 8l-5 5-5-5" />
        <path d="M7 16l5-5 5 5" />
      </svg>
    ),
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V6.5L15.5 2z" />
            <path d="M15 2v5h5" />
            <path d="M10 16h4" />
            <path d="M10 12h7" />
            <path d="M10 8h7" />
        </svg>
    ),
  },
  {
    id: 'taxFiling',
    label: 'Tax Filing',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
  },
  {
    id: 'chartOfAccounts',
    label: 'Accounting',
     icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4m0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>
            <path d="M9 4v16"/>
        </svg>
    ),
    children: [
        { id: 'chartOfAccounts', label: 'Chart of Accounts', icon: <></> },
        { id: 'journalEntries', label: 'Journal Entries', icon: <></> },
        { id: 'budgeting', label: 'Budgeting', icon: <></> },
        { id: 'auditTrail', label: 'Audit Trail', icon: <></> }
    ]
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>
       </svg>
    ),
    children: [
        { id: 'connections', label: 'Bank Connections', icon: <></> },
        { id: 'integrations', label: 'Integrations', icon: <></> }
    ]
  },
];
