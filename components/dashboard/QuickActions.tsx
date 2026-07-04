import React from 'react';

interface QuickActionsProps {
  onAction: (view: string) => void;
}

const actions = [
  { view: 'receivables', icon: '📄', label: 'New Invoice', color: 'bg-green-500/20 text-green-400' },
  { view: 'payables', icon: '📋', label: 'Record Bill', color: 'bg-red-500/20 text-red-400' },
  { view: 'transactions', icon: '💱', label: 'Add Transaction', color: 'bg-blue-500/20 text-blue-400' },
  { view: 'payroll', icon: '👥', label: 'Run Payroll', color: 'bg-purple-500/20 text-purple-400' },
  { view: 'expenses', icon: '🧾', label: 'Log Expense', color: 'bg-orange-500/20 text-orange-400' },
  { view: 'inventory', icon: '📦', label: 'Add Item', color: 'bg-cyan-500/20 text-cyan-400' },
  { view: 'contacts', icon: '👤', label: 'Add Contact', color: 'bg-pink-500/20 text-pink-400' },
  { view: 'chat', icon: '🤖', label: 'Ask AI', color: 'bg-brand-cyan/20 text-brand-cyan' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {actions.map((action, i) => (
      <button
        key={i}
        onClick={() => onAction(action.view)}
        className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:border-brand-cyan/30 transition-all ${action.color}`}
      >
        <span className="text-xl">{action.icon}</span>
        <span className="text-sm font-bold">{action.label}</span>
      </button>
    ))}
  </div>
);
