import React, { useState, useEffect } from 'react';
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

  const filteredTransactions = selectedEntityId === 'all'
    ? transactions
    : transactions.filter(t => t.entityId === selectedEntityId || !t.entityId);

  const filteredInvoices = selectedEntityId === 'all'
    ? invoices
    : invoices.filter(i => i.entityId === selectedEntityId || !i.entityId);

  const filteredBills = selectedEntityId === 'all'
    ? bills
    : bills.filter(b => b.entityId === selectedEntityId || !b.entityId);

  const totalRevenue = filteredTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const outstandingReceivables = filteredInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
  const outstandingPayables = filteredBills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);

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
              const entTx = transactions.filter(t => t.entityId === entity.id);
              const entInv = invoices.filter(i => i.entityId === entity.id);
              return (
                <tr
                  key={entity.id}
                  className={`border-b border-gray-50 dark:border-white/5 cursor-pointer hover:bg-white/5 transition-all ${selectedEntityId === entity.id ? 'bg-brand-cyan/10' : ''}`}
                  onClick={() => setSelectedEntityId(entity.id)}
                >
                  <td className="p-4 font-bold text-sm">{entity.name}</td>
                  <td className="p-4 text-right text-xs text-gray-500">{entity.type}</td>
                  <td className="p-4 text-right text-xs text-gray-500">{entity.currency}</td>
                  <td className="p-4 text-right text-sm">{entTx.length}</td>
                  <td className="p-4 text-right text-sm">{entInv.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
