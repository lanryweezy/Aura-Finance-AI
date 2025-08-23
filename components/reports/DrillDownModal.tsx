
import React from 'react';
import type { CategorizedTransaction } from '../../types';
import { Card } from '../ui/Card';

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: { title: string; transactions: CategorizedTransaction[] } | null;
}

const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 no-print" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-6 w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">{data.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="overflow-y-auto flex-grow pr-2">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-tertiary">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-400">Date</th>
                                <th className="p-3 text-sm font-semibold text-gray-400">Narration</th>
                                <th className="p-3 text-sm font-semibold text-gray-400">Category</th>
                                <th className="p-3 text-sm font-semibold text-gray-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {data.transactions.map(t => (
                                <tr key={t.id} className="hover:bg-dark-secondary/50">
                                    <td className="p-3 whitespace-nowrap text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-3 max-w-sm text-white truncate" title={t.narration}>{t.narration}</td>
                                    <td className="p-3 text-gray-300">{t.category}</td>
                                    <td className={`p-3 font-mono text-right ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatNaira(t.amount)}
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
