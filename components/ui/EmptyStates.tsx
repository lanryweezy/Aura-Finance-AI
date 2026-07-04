import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="text-lg font-bold text-gray-300 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all active:scale-95"
      >
        {action.label}
      </button>
    )}
  </div>
);

export const EmptyInvoice: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState icon="📄" title="No invoices yet" description="Create your first invoice to start tracking payments" action={{ label: 'Create Invoice', onClick: onAdd }} />
);

export const EmptyBill: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState icon="📋" title="No bills yet" description="Record vendor bills to track your expenses" action={{ label: 'Add Bill', onClick: onAdd }} />
);

export const EmptyExpense: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState icon="🧾" title="No expenses" description="Log expenses to track your spending" action={{ label: 'Log Expense', onClick: onAdd }} />
);

export const EmptyContact: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState icon="👤" title="No contacts" description="Add customers and vendors to get started" action={{ label: 'Add Contact', onClick: onAdd }} />
);

export const EmptyInventory: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState icon="📦" title="No inventory items" description="Add products and services to track stock" action={{ label: 'Add Item', onClick: onAdd }} />
);

export const EmptyTransaction: React.FC = () => (
  <EmptyState icon="💱" title="No transactions" description="Transactions will appear here once you connect a bank account or add manually" />
);

export const EmptyProject: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState icon="📁" title="No projects" description="Create projects to track budgets and profitability" action={{ label: 'Create Project', onClick: onAdd }} />
);

export const EmptyPayroll: React.FC = () => (
  <EmptyState icon="👥" title="No employees" description="Add employees to start running payroll" />
);

export const EmptyReport: React.FC = () => (
  <EmptyState icon="📊" title="No data for reports" description="Add transactions, invoices, and bills to generate financial reports" />
);
