import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { entityService } from '../services/entityService';
import type { Entity } from '../types';

export const MultiEntityDashboard: React.FC = () => {
  const { entities, setEntities, selectedEntityId, setSelectedEntityId } = useAppStore();
  const { transactions, invoices, bills, employees } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    entityService.fetchEntities().then(e => { setEntities(e); setLoading(false); });
  }, []);

  const { filteredTransactions, filteredInvoices, filteredBills } = useMemo(() => {
    return {
      filteredTransactions: selectedEntityId === 'all'
        ? transactions
        : transactions.filter(t => t.entityId === selectedEntityId || !t.entityId),
      filteredInvoices: selectedEntityId === 'all'
        ? invoices
        : invoices.filter(i => i.entityId === selectedEntityId || !i.entityId),
      filteredBills: selectedEntityId === 'all'
        ? bills
        : bills.filter(b => b.entityId === selectedEntityId || !b.entityId),
    };
  }, [transactions, invoices, bills, selectedEntityId]);

  // ⚡ Bolt Optimization: Pre-compute counts for entities in a single pass O(T + I)
  // This avoids O(E * T) and O(E * I) iterations inside the render loop's entities.map()
  const { entityTxCounts, entityInvCounts } = useMemo(() => {
    const txCounts = new Map<string, number>();
    const invCounts = new Map<string, number>();

    for (let i = 0; i < transactions.length; i++) {
      const eid = transactions[i].entityId;
      if (eid) {
        txCounts.set(eid, (txCounts.get(eid) || 0) + 1);
      }
    }

    for (let i = 0; i < invoices.length; i++) {
      const eid = invoices[i].entityId;
      if (eid) {
        invCounts.set(eid, (invCounts.get(eid) || 0) + 1);
      }
    }

    return { entityTxCounts: txCounts, entityInvCounts: invCounts };
  }, [transactions, invoices]);

  const { totalRevenue, totalExpenses, outstandingReceivables, outstandingPayables } = useMemo(() => {
    let revenue = 0;
    let expenses = 0;
    let receivables = 0;
    let payables = 0;

    // ⚡ Bolt Optimization: Single pass for transactions to calculate both revenue and expenses,
    // avoiding multiple filter allocations and array iterations.
    for (let i = 0; i < filteredTransactions.length; i++) {
      if (filteredTransactions[i].type === 'credit') {
        revenue += filteredTransactions[i].amount;
      } else if (filteredTransactions[i].type === 'debit') {
        expenses += filteredTransactions[i].amount;
      }
    }

    // ⚡ Bolt Optimization: Single pass for invoices to calculate receivables without O(N) allocation
    for (let i = 0; i < filteredInvoices.length; i++) {
      if (filteredInvoices[i].status !== 'Paid') {
        receivables += filteredInvoices[i].total;
      }
    }

    // ⚡ Bolt Optimization: Single pass for bills to calculate payables without O(N) allocation
    for (let i = 0; i < filteredBills.length; i++) {
      if (filteredBills[i].status !== 'Paid') {
        payables += filteredBills[i].amount;
      }
    }

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      outstandingReceivables: receivables,
      outstandingPayables: payables,
    };
  }, [filteredTransactions, filteredInvoices, filteredBills]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading entities...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Multi-Entity Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Consolidated view across all entities</p>
        </div>
        <select
          value={selectedEntityId || 'all'}
          onChange={(e) => setSelectedEntityId(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-cyan"
        >
          <option value="all">All Entities</option>
          {entities.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-2xl font-black mt-1 text-green-400">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Expenses</p>
          <p className="text-2xl font-black mt-1 text-red-400">₦{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Receivables</p>
          <p className="text-2xl font-black mt-1 text-yellow-400">₦{outstandingReceivables.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Payables</p>
          <p className="text-2xl font-black mt-1 text-orange-400">₦{outstandingPayables.toLocaleString()}</p>
        </div>
      </div>

      {/* Entity Breakdown */}
      <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/10">
              <th className="text-left p-4 text-xs font-bold text-gray-500">Entity</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Type</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Currency</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Transactions</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Invoices</th>
            </tr>
          </thead>
          <tbody>
            {entities.map(entity => {
              const txCount = entityTxCounts.get(entity.id) || 0;
              const invCount = entityInvCounts.get(entity.id) || 0;
              return (
                <tr
                  key={entity.id}
                  className={`border-b border-gray-50 dark:border-white/5 cursor-pointer hover:bg-white/5 transition-all ${selectedEntityId === entity.id ? 'bg-brand-cyan/10' : ''}`}
                  onClick={() => setSelectedEntityId(entity.id)}
                >
                  <td className="p-4 font-bold text-sm">{entity.name}</td>
                  <td className="p-4 text-right text-xs text-gray-500">{entity.type}</td>
                  <td className="p-4 text-right text-xs text-gray-500">{entity.currency}</td>
                  <td className="p-4 text-right text-sm">{txCount}</td>
                  <td className="p-4 text-right text-sm">{invCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
