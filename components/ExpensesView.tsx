import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { receiptOcrService } from '../services/receiptOcrService';
import type { Expense } from '../types';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  submitted: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  reimbursed: 'bg-blue-500/20 text-blue-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export const ExpensesView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisMonthTotal: 0, pending: 0, approved: 0, reimbursed: 0 });
  const [form, setForm] = useState({ amount: 0, category: 'Office Supplies', description: '', date: new Date().toISOString().split('T')[0], vendor: '' });
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    Promise.all([expenseService.fetch(), expenseService.getStats()]).then(([e, s]) => { setExpenses(e); setStats(s); }).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.description || form.amount <= 0) return;
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const exp = await expenseService.create({ ...form, status: 'draft', submittedBy: user.id, submittedByName: user.name });
    setExpenses(prev => [exp, ...prev]);
    setShowAdd(false);
    setForm({ amount: 0, category: 'Office Supplies', description: '', date: new Date().toISOString().split('T')[0], vendor: '' });
  };

  const handleScanReceipt = async () => {
    if (!scanFile) return;
    setScanning(true);
    try {
      const data = await receiptOcrService.scanReceipt(URL.createObjectURL(scanFile), scanFile);
      setForm(prev => ({ ...prev, amount: data.totalAmount, description: data.description, vendor: data.merchantName, date: data.date }));
    } catch (e) { console.error(e); }
    setScanning(false);
  };

  const handleSubmit = async (id: string) => {
    await expenseService.approve(id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'submitted' as const } : e));
  };

  const handleApprove = async (id: string) => {
    await expenseService.approve(id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading expenses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Expenses</h2>
          <p className="text-gray-500 mt-1">Track and manage team spending</p>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold cursor-pointer hover:bg-white/10">
            📷 Scan Receipt
            <input type="file" accept="image/*" className="hidden" onChange={e => { setScanFile(e.target.files?.[0] || null); if (e.target.files?.[0]) { setScanning(true); handleScanReceipt(); } }} />
          </label>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80">+ New Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-2xl font-black mt-1">₦{stats.thisMonthTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-black mt-1 text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Approved</p>
          <p className="text-2xl font-black mt-1 text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Reimbursed</p>
          <p className="text-2xl font-black mt-1 text-blue-400">₦{stats.reimbursed.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100 dark:border-white/10">
            <th className="text-left p-4 text-xs font-bold text-gray-500">Date</th>
            <th className="text-left p-4 text-xs font-bold text-gray-500">Description</th>
            <th className="text-left p-4 text-xs font-bold text-gray-500">Category</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Amount</th>
            <th className="text-center p-4 text-xs font-bold text-gray-500">Status</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-medium">{exp.description}</td>
                <td className="p-4 text-xs text-gray-500">{exp.category}</td>
                <td className="p-4 text-sm text-right font-bold">₦{exp.amount.toLocaleString()}</td>
                <td className="p-4 text-center"><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[exp.status]}`}>{exp.status}</span></td>
                <td className="p-4 text-right">
                  {exp.status === 'draft' && <button onClick={() => handleSubmit(exp.id)} className="text-xs text-brand-cyan hover:underline">Submit</button>}
                  {exp.status === 'submitted' && <button onClick={() => handleApprove(exp.id)} className="text-xs text-green-400 hover:underline">Approve</button>}
                </td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-500">No expenses yet</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">New Expense</h3>
            {scanning && <p className="text-sm text-brand-cyan animate-pulse">Scanning receipt with AI...</p>}
            <input type="number" placeholder="Amount (₦)" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-cyan" />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-cyan" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm">
              {['Office Supplies', 'Travel', 'Meals', 'Software', 'Marketing', 'Utilities', 'Professional Fees', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-bold">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 bg-brand-cyan text-black rounded-xl font-bold">Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
