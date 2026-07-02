import React, { useState, useEffect } from 'react';
import { bulkPaymentService } from '../services/bulkPaymentService';
import type { BulkPayment } from '../types';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  processing: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
};

export const BulkPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<BulkPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', recipients: '' });

  useEffect(() => {
    bulkPaymentService.fetch().then(setPayments).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const lines = form.recipients.split('\n').filter(l => l.trim());
    const recipients = lines.map(line => {
      const [name, bank, account, amount] = line.split(',').map(s => s.trim());
      return { name: name || 'Unknown', bankName: bank || 'Unknown', accountNumber: account || '0000000000', amount: Number(amount) || 0 };
    }).filter(r => r.amount > 0);

    if (recipients.length === 0) return;
    const bp = await bulkPaymentService.create(form.name, recipients);
    setPayments(prev => [bp, ...prev]);
    setShowCreate(false);
    setForm({ name: '', recipients: '' });
  };

  const handleProcess = async (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'processing' as const } : p));
    await bulkPaymentService.process(id, []);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' as const, processedCount: p.recipientCount } : p));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Bulk Payments</h2>
          <p className="text-gray-500 mt-1">Pay multiple vendors at once</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80">+ New Batch</button>
      </div>

      <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100 dark:border-white/10">
            <th className="text-left p-4 text-xs font-bold text-gray-500">Name</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Amount</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Recipients</th>
            <th className="text-center p-4 text-xs font-bold text-gray-500">Status</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {payments.map(bp => (
              <tr key={bp.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm font-medium">{bp.name}</td>
                <td className="p-4 text-sm text-right font-bold">₦{(bp.totalAmount || 0).toLocaleString()}</td>
                <td className="p-4 text-sm text-right">{bp.recipientCount}</td>
                <td className="p-4 text-center"><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[bp.status]}`}>{bp.status}</span></td>
                <td className="p-4 text-right">
                  {bp.status === 'draft' && <button onClick={() => handleProcess(bp.id)} className="text-xs text-brand-cyan hover:underline">Process</button>}
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No bulk payments yet</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">Create Bulk Payment</h3>
            <input type="text" placeholder="Batch name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-cyan" />
            <textarea placeholder="Recipients (one per line: Name, Bank, Account, Amount)&#10;e.g. John Doe, GTBank, 0123456789, 50000" value={form.recipients} onChange={e => setForm(p => ({ ...p, recipients: e.target.value }))} rows={6} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-cyan" />
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-bold">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-2.5 bg-brand-cyan text-black rounded-xl font-bold">Create Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
