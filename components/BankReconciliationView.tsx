
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import type { BankConnection, CategorizedTransaction } from '../types';

interface BankReconciliationViewProps {
    connections: BankConnection[];
    transactions: CategorizedTransaction[];
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({ connections, transactions }) => {
    const { formatAmount } = useCurrency();
    const [selectedBankId, setSelectedBankId] = useState(connections[0]?.id || '');
    const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());
    const [statementBalance, setStatementBalance] = useState(0);

    const bankTransactions = transactions.filter(t => true); // In a real app, filter by bank connection
    const selectedBank = connections.find(c => c.id === selectedBankId);

    const toggleCleared = (id: string) => {
        const next = new Set(clearedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setClearedIds(next);
    };

    const bookBalance = (selectedBank?.balance || 0) + bankTransactions.reduce((sum, t) => {
        if (!clearedIds.has(t.id)) return sum;
        return sum + (t.type === 'credit' ? t.amount : -t.amount);
    }, 0);

    const difference = statementBalance - bookBalance;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Bank Reconciliation</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Match your book entries with bank statements effortlessly.</p>
                </div>
                <div className="flex gap-4">
                     <select
                        value={selectedBankId}
                        onChange={e => setSelectedBankId(e.target.value)}
                        className="bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-brand-cyan transition-all shadow-sm"
                    >
                        {connections.map(c => <option key={c.id} value={c.id}>{c.bankName} - {c.accountNumber}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Statement Balance</h4>
                    <input
                        type="number"
                        value={statementBalance}
                        onChange={e => setStatementBalance(Number(e.target.value))}
                        className="text-2xl font-black bg-transparent w-full outline-none font-mono text-gray-900 dark:text-white"
                        placeholder="0.00"
                    />
                </Card>
                <Card className="p-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Adjusted Book Balance</h4>
                    <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">{formatAmount(bookBalance)}</p>
                </Card>
                <Card className={`p-6 border-2 ${difference === 0 ? 'border-green-500/20 bg-green-500/5' : 'border-brand-pink/20 bg-brand-pink/5'}`}>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Difference</h4>
                    <p className={`text-2xl font-black font-mono ${difference === 0 ? 'text-green-500' : 'text-brand-pink'}`}>{formatAmount(difference)}</p>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center">
                    <button
                        disabled={difference !== 0}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${difference === 0 ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/20 active:scale-95' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                    >
                        Finalize Recon
                    </button>
                </Card>
            </div>

            <Card className="overflow-hidden border-gray-100 dark:border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-aura-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th className="p-4 w-12">
                                <input type="checkbox" className="rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan shadow-sm" />
                            </th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Date</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Narration</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Amount</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-center">Type</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bankTransactions.map(t => (
                            <tr
                                key={t.id}
                                onClick={() => toggleCleared(t.id)}
                                className={`cursor-pointer transition-colors group ${clearedIds.has(t.id) ? 'bg-brand-cyan/5' : 'hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50'}`}
                            >
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={clearedIds.has(t.id)}
                                        onChange={() => toggleCleared(t.id)}
                                        className="rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan"
                                    />
                                </td>
                                <td className="p-4 text-sm font-mono text-aura-gray-500 dark:text-gray-400">{t.date}</td>
                                <td className="p-4 font-bold text-aura-gray-900 dark:text-white">{t.narration}</td>
                                <td className={`p-4 font-mono font-bold text-right ${t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatAmount(t.amount)}
                                </td>
                                <td className="p-4 text-[10px] font-black uppercase tracking-widest text-aura-gray-400 text-center">{t.type}</td>
                                <td className="p-4">
                                    {clearedIds.has(t.id) ? (
                                        <span className="text-green-500 flex items-center gap-1 text-[10px] font-black uppercase">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Cleared
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-[10px] font-black uppercase">Pending</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
