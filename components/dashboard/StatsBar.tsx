import React, { useMemo } from 'react';
import { useCurrency } from '../ui/CurrencyProvider';
import type { CategorizedTransaction, Bill, Invoice } from '../../types';

interface StatsBarProps {
  transactions: CategorizedTransaction[];
  bills: Bill[];
  invoices: Invoice[];
}

export const StatsBar: React.FC<StatsBarProps> = React.memo(({ transactions, bills, invoices }) => {
  const { formatAmount } = useCurrency();

  const { totalIncome, totalExpenses, outstandingReceivables, outstandingPayables } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let receivables = 0;
    let payables = 0;

    // ⚡ Bolt Optimization: Single pass for transactions, avoiding O(N) array allocation from .filter()
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].type === 'credit') {
        income += transactions[i].amount;
      } else if (transactions[i].type === 'debit') {
        expenses += transactions[i].amount;
      }
    }

    // ⚡ Bolt Optimization: Single pass for invoices
    for (let i = 0; i < invoices.length; i++) {
      if (invoices[i].status !== 'Paid') {
        receivables += invoices[i].total;
      }
    }

    // ⚡ Bolt Optimization: Single pass for bills
    for (let i = 0; i < bills.length; i++) {
      if (bills[i].status !== 'Paid') {
        payables += bills[i].amount;
      }
    }

    return {
      totalIncome: income,
      totalExpenses: expenses,
      outstandingReceivables: receivables,
      outstandingPayables: payables,
    };
  }, [transactions, invoices, bills]);

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
});

StatsBar.displayName = 'StatsBar';
