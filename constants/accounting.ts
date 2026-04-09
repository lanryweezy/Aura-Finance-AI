import type { Account } from '../types';

export const DEFAULT_CATEGORIES: Account[] = [
    // Revenue
    { name: 'Sales Revenue', type: 'Revenue' },
    { name: 'Service Revenue', type: 'Revenue' },
    { name: 'Interest Income', type: 'Revenue' },
    { name: 'Other Income', type: 'Revenue' },
    // Equity
    { name: 'Capital Injection', type: 'Equity' },
    { name: "Owner's Draw", type: 'Equity' },
    // Expenses
    { name: 'Salaries & Wages', type: 'Expense' },
    { name: 'Utilities', type: 'Expense' },
    { name: 'Software & Subscriptions', type: 'Expense' },
    { name: 'Marketing & Advertising', type: 'Expense' },
    { name: 'Rent & Leases', type: 'Expense' },
    { name: 'Travel', type: 'Expense' },
    { name: 'Meals & Entertainment', type: 'Expense' },
    { name: 'Hardware', type: 'Expense' },
    { name: 'Bank Charges & Fees', type: 'Expense' },
    { name: 'Professional Fees', type: 'Expense' },
    { name: 'Legal Fees', type: 'Expense' },
    { name: 'Insurance', type: 'Expense' },
    { name: 'Repairs & Maintenance', type: 'Expense' },
    { name: 'Cost of Sales', type: 'Expense' },
    { name: 'COGS - Raw Materials', type: 'Expense' },
    { name: 'COGS - Direct Labor', type: 'Expense' },
    { name: 'Taxes - Corporate', type: 'Expense' },
    { name: 'Miscellaneous', type: 'Expense' },
    // Other / Special
    { name: 'Inter-account Transfer', type: 'Expense' },
    { name: 'Uncategorized', type: 'Expense' },
];
