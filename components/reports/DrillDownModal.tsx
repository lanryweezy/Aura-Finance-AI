import React from 'react';
import type { CategorizedTransaction } from '../../types';
import { Card } from '../ui/Card';
import { useCurrency } from "../ui/CurrencyProvider";

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: { title: string; transactions: CategorizedTransaction[] } | null;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, data }) => {
    const { formatAmount } = useCurrency();
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 no-print backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-6 w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white">{data.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-aura-gray-900 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <div className="overflow-y-auto flex-grow pr-2">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-aura-gray-50 dark:bg-dark-tertiary">
                            <tr>
                                <th className="p-3 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Date</th>
                                <th className="p-3 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Narration</th>
                                <th className="p-3 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Category</th>
                                <th className="p-3 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {data.transactions.map(t => (
                                <tr key={t.id} className="hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group">
                                    <td className="p-3 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-3 max-w-sm text-aura-gray-900 dark:text-white font-medium truncate" title={t.narration}>{t.narration}</td>
                                    <td className="p-3 text-xs text-aura-gray-500 dark:text-gray-500">{t.category}</td>
                                    <td className={`p-3 font-mono text-right font-bold ${t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatAmount(t.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {data.transactions.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No transactions for this item in the selected period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
