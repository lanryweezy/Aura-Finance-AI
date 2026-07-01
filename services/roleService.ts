import { supabase } from './supabaseClient';
import { db } from './db';

export type SystemRole = 'Owner' | 'Admin' | 'Accountant' | 'Viewer' | 'Custom';

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const ALL_PERMISSIONS: RolePermission[] = [
  // Dashboard
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access the main dashboard', category: 'Dashboard' },
  // Transactions
  { id: 'transactions.view', name: 'View Transactions', description: 'View transaction list', category: 'Transactions' },
  { id: 'transactions.create', name: 'Create Transactions', description: 'Add manual transactions', category: 'Transactions' },
  { id: 'transactions.edit', name: 'Edit Transactions', description: 'Modify transaction categories', category: 'Transactions' },
  { id: 'transactions.delete', name: 'Delete Transactions', description: 'Remove transactions', category: 'Transactions' },
  // Invoices
  { id: 'invoices.view', name: 'View Invoices', description: 'View invoices', category: 'Invoices' },
  { id: 'invoices.create', name: 'Create Invoices', description: 'Create new invoices', category: 'Invoices' },
  { id: 'invoices.edit', name: 'Edit Invoices', description: 'Modify invoices', category: 'Invoices' },
  { id: 'invoices.delete', name: 'Delete Invoices', description: 'Delete invoices', category: 'Invoices' },
  { id: 'invoices.approve', name: 'Approve Invoices', description: 'Approve invoices for sending', category: 'Invoices' },
  // Bills
  { id: 'bills.view', name: 'View Bills', description: 'View bills', category: 'Bills' },
  { id: 'bills.create', name: 'Create Bills', description: 'Create new bills', category: 'Bills' },
  { id: 'bills.pay', name: 'Pay Bills', description: 'Mark bills as paid', category: 'Bills' },
  // Payroll
  { id: 'payroll.view', name: 'View Payroll', description: 'View payroll data', category: 'Payroll' },
  { id: 'payroll.manage', name: 'Manage Payroll', description: 'Add/edit employees, run payroll', category: 'Payroll' },
  // Accounting
  { id: 'accounting.view', name: 'View Accounting', description: 'View chart of accounts, journal entries', category: 'Accounting' },
  { id: 'accounting.manage', name: 'Manage Accounting', description: 'Create journal entries, manage accounts', category: 'Accounting' },
  // Inventory
  { id: 'inventory.view', name: 'View Inventory', description: 'View inventory items', category: 'Inventory' },
  { id: 'inventory.manage', name: 'Manage Inventory', description: 'Add/edit inventory items', category: 'Inventory' },
  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'Access financial reports', category: 'Reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Download reports as PDF/CSV', category: 'Reports' },
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'View organization settings', category: 'Settings' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Change org settings, users, billing', category: 'Settings' },
  // Cards
  { id: 'cards.view', name: 'View Cards', description: 'View corporate cards', category: 'Cards' },
  { id: 'cards.manage', name: 'Manage Cards', description: 'Create/freeze/unfreeze cards', category: 'Cards' },
  // Approvals
  { id: 'approvals.view', name: 'View Approvals', description: 'View approval requests', category: 'Approvals' },
  { id: 'approvals.approve', name: 'Approve Requests', description: 'Approve/reject requests', category: 'Approvals' },
  // NRS
  { id: 'nrs.submit', name: 'Submit to NRS', description: 'Submit invoices to NRS', category: 'NRS' },
  // AI
  { id: 'ai.use', name: 'Use AI Features', description: 'Access AI chat, insights, alerts', category: 'AI' },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  'Owner': ALL_PERMISSIONS.map(p => p.id),
  'Admin': ALL_PERMISSIONS.map(p => p.id),
  'Accountant': [
    'dashboard.view', 'transactions.view', 'transactions.create', 'transactions.edit',
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.approve',
    'bills.view', 'bills.create', 'bills.pay',
    'payroll.view', 'payroll.manage',
    'accounting.view', 'accounting.manage',
    'inventory.view', 'inventory.manage',
    'reports.view', 'reports.export',
    'cards.view', 'approvals.view', 'approvals.approve',
    'nrs.submit', 'ai.use',
  ],
  'Viewer': [
    'dashboard.view', 'transactions.view', 'invoices.view', 'bills.view',
    'payroll.view', 'accounting.view', 'inventory.view', 'reports.view',
    'cards.view', 'approvals.view', 'ai.use',
  ],
};

export const roleService = {
  getRolePermissions: (role: string): string[] => {
    return ROLE_DEFAULTS[role] || ROLE_DEFAULTS['Viewer'];
  },

  hasPermission: (userRole: string, permissionId: string): boolean => {
    if (userRole === 'Owner' || userRole === 'Admin') return true;
    const perms = ROLE_DEFAULTS[userRole] || ROLE_DEFAULTS['Viewer'];
    return perms.includes(permissionId);
  },

  getUserPermissions: async (userId: string): Promise<string[]> => {
    if (!supabase) return ROLE_DEFAULTS['Viewer'];
    const { data } = await supabase
      .from('user_permissions')
      .select('permissions')
      .eq('user_id', userId)
      .single();
    return data?.permissions || ROLE_DEFAULTS['Viewer'];
  },

  setUserPermissions: async (userId: string, permissions: string[]): Promise<void> => {
    if (!supabase) return;
    await supabase.from('user_permissions').upsert({
      user_id: userId,
      permissions: JSON.stringify(permissions),
      organization_id: db.getOrgId(),
    });
  },

  getRoles: (): { value: string; label: string; description: string; permissionCount: number }[] => [
    { value: 'Owner', label: 'Owner', description: 'Full access to everything', permissionCount: ALL_PERMISSIONS.length },
    { value: 'Admin', label: 'Admin', description: 'Full access except billing', permissionCount: ALL_PERMISSIONS.length },
    { value: 'Accountant', label: 'Accountant', description: 'Manage books, invoices, payroll', permissionCount: ROLE_DEFAULTS['Accountant'].length },
    { value: 'Viewer', label: 'Viewer', description: 'Read-only access', permissionCount: ROLE_DEFAULTS['Viewer'].length },
  ],

  getPermissionsByCategory: (): Record<string, RolePermission[]> => {
    const grouped: Record<string, RolePermission[]> = {};
    ALL_PERMISSIONS.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    return grouped;
  },
};
