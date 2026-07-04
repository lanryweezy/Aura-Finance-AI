import React from 'react';
import { useCurrency } from '../ui/CurrencyProvider';
import type { CategorizedTransaction, Bill, Invoice } from '../../types';

interface StatsBarProps {
  transactions: CategorizedTransaction[];
  bills: Bill[];
  invoices: Invoice[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ transactions, bills, invoices }) => {
  const { formatAmount } = useCurrency();

  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const outstandingReceivables = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
  const outstandingPayables = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);

  const stats = [
    { label: 'Total Income', value: formatAmount(totalIncome), color: 'text-green-400' },
    { label: 'Total Expenses', value: formatAmount(totalExpenses), color: 'text-red-400' },
    { label: 'Outstanding', value: formatAmount(outstandingReceivables), color: 'text-yellow-400' },
    { label: 'Payables', value: formatAmount(outstandingPayables), color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-500">{stat.label}</p>
          <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};
